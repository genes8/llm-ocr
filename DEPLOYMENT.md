# LLM-OCR Production Deployment Guide

## Overview
This guide covers deploying the LLM-OCR application (Flask backend + React frontend) in production.

## Backend Deployment

### Environment Setup
1. Create production virtual environment:
```bash
cd backend
python3 -m venv prod_venv
source prod_venv/bin/activate
pip install -r requirements.txt
```

2. Set environment variables:
```bash
export FLASK_ENV=production
export OPENROUTER_API_KEY=your_actual_api_key_here
```

**Important**: Ensure the API key is not a placeholder value. The application prioritizes `.env` files over environment variables and filters out template values like `your-api-key-here`.

### Production Server
Use Gunicorn for production:
```bash
# Basic production server
gunicorn -w 4 -b 0.0.0.0:8000 app:app

# With better settings
gunicorn \
  --workers 4 \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --keepalive 10 \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  --log-level info \
  app:app
```

### Security Considerations
1. **CORS**: Update CORS origins in `app.py` to your frontend domain
2. **File Upload**: Implement virus scanning
3. **Rate Limiting**: Add rate limiting for API endpoints
4. **Authentication**: Add API key authentication if needed
5. **File Cleanup**: Ensure temporary files are cleaned up
6. **Environment Variables**: Use `.env.production` files and avoid placeholder values in production
7. **API Key Management**: Store API keys securely and never commit them to version control

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-api-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        
        # File upload size limit
        client_max_body_size 20M;
    }
}
```

## Frontend Deployment

### Build for Production
```bash
cd frontend
npm run build
```

### Environment Configuration
Update `.env.production`:
```
VITE_API_BASE_URL=https://your-api-domain.com
VITE_API_TIMEOUT=120000
```

### Static File Serving
Serve the `dist/` folder using any static file server:

#### Nginx
```nginx
server {
    listen 80;
    server_name your-frontend-domain.com;
    root /path/to/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Vercel/Netlify
Upload the `dist/` folder to Vercel or Netlify for easy static hosting.

## Docker Deployment

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-hrv \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:8000", "--timeout", "120", "app:app"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - FLASK_ENV=production
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    volumes:
      - /tmp/ocr-uploads:/tmp/ocr-uploads
    restart: unless-stopped
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
```

## Monitoring and Logging

### Backend Logging
```python
import logging
from logging.handlers import RotatingFileHandler

# In app.py
if not app.debug:
    file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
```

### Health Checks
The `/health` endpoint can be used for load balancer health checks.

### Performance Monitoring
Consider adding:
- Application performance monitoring (APM) tools
- Error tracking (Sentry)
- Metrics collection (Prometheus)

## Troubleshooting Production Issues

### API Key Authentication
- **Problem**: LLM processing fails with 401 Unauthorized
- **Solution**: 
  - Check `.env.production` file has valid OPENROUTER_API_KEY
  - Ensure no placeholder values (avoid `your-api-key-here`)
  - Clear conflicting environment variables before deployment
  - Verify API key has sufficient quota at https://openrouter.ai/

### Environment Variable Priority
- **Problem**: Configuration not loading correctly
- **Solution**:
  - Use `.env.production` files for consistent configuration
  - Application prioritizes .env files over system environment variables
  - Remove any conflicting environment variables from system/shell profiles

### File Upload Issues
- **Problem**: Large files failing to upload
- **Solution**:
  - Check `MAX_CONTENT_LENGTH` in Flask configuration
  - Verify Nginx `client_max_body_size` setting
  - Ensure adequate disk space in upload temporary directory

## Backup and Recovery
- Regular backups of uploaded files (if stored)
- Configuration backups
- Database backups (if using a database)

## Scaling Considerations
- Horizontal scaling: Multiple backend instances behind load balancer
- File storage: Use cloud storage (S3, GCS) instead of local filesystem
- Caching: Redis for frequently accessed data
- CDN: For static assets and processed results