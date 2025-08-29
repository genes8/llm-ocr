# LLM-OCR: Intelligent Document Processing

A modern web application that combines OCR (Optical Character Recognition) and LLM (Large Language Model) technologies to extract and process text from images and documents.

## 🚀 Features

- **Dual Processing Methods**: Choose between traditional OCR (Tesseract) or advanced LLM-based vision models
- **Multi-language Support**: Support for English, Croatian, French, German, Spanish, Italian, and combinations
- **Modern Web Interface**: React-based frontend with drag-and-drop file upload
- **Real-time Processing**: Live progress tracking and error handling
- **Export Options**: Download results as Markdown, CSV, or structured data
- **Production Ready**: Docker support, deployment guides, and monitoring

## 🏗️ Architecture

### Backend (Python Flask)
- **API Server**: RESTful API with file upload and processing endpoints
- **OCR Engine**: Tesseract integration for traditional text extraction
- **LLM Integration**: OpenRouter API for advanced vision model processing
- **Error Handling**: Graceful fallbacks and comprehensive error handling

### Frontend (React + TypeScript)
- **File Upload**: Drag-and-drop interface with support for images and PDFs
- **Processing Options**: Method and language selection
- **Results Display**: Structured data view with editing capabilities
- **Raw Text View**: Toggle to see original extracted text

## 🛠️ Technology Stack

### Backend
- **Python 3.11+**
- **Flask** - Web framework
- **pytesseract** - OCR engine wrapper
- **Pillow** - Image processing
- **Flask-CORS** - Cross-origin requests
- **OpenRouter API** - LLM vision models

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **react-dropzone** - File upload component

## 📦 Quick Start

### Prerequisites

```bash
# Install Tesseract OCR
# macOS
brew install tesseract

# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# Install additional language packs if needed
brew install tesseract-lang  # macOS
sudo apt-get install tesseract-ocr-hrv tesseract-ocr-fra  # Linux
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment configuration
cp .env.production .env
# Edit .env and add your OPENROUTER_API_KEY from https://openrouter.ai/

# Run development server
python app.py
```

Backend will be available at `http://localhost:8000`

**Note**: For LLM processing, you need an OpenRouter API key. The application will automatically fall back to traditional OCR if the LLM API is not available.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
OPENROUTER_API_KEY=your_api_key_here  # Required for LLM processing - get from https://openrouter.ai/
FLASK_ENV=development
MAX_CONTENT_LENGTH=16777216  # 16MB
```

**Important**: The application prioritizes API keys from `.env` files over system environment variables and automatically filters out placeholder values (like `your-api-key-here`). Always set your real API key in the `.env` file.

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=60000
```

## 📱 Usage

1. **Upload Document**: Drag and drop an image or PDF into the upload area
2. **Select Options**: 
   - Choose processing method (OCR or LLM)
   - Select document language
3. **Process**: Click "Process Document" to start extraction
4. **Review Results**: 
   - View structured data in the results panel
   - Edit extracted information as needed
   - Toggle raw text view to see original extraction
5. **Export**: Download results as Markdown, CSV, or structured data

## 🔌 API Endpoints

### Health Check
```bash
GET /health
```

### Upload File
```bash
POST /api/upload
Content-Type: multipart/form-data

Response: {
  "file_id": "unique_id",
  "original_name": "document.png",
  "size": 1024,
  "status": "uploaded"
}
```

### Process Document
```bash
POST /api/process
Content-Type: application/json

{
  "file_id": "unique_id",
  "method": "ocr|llm",
  "language": "eng"
}

Response: {
  "status": "success",
  "data": {
    "raw_text": "extracted text...",
    "lines": ["line1", "line2"],
    "method_used": "ocr",
    "language": "eng"
  }
}
```

### Get Languages
```bash
GET /api/languages

Response: {
  "languages": [
    {"code": "eng", "name": "English"},
    {"code": "hrv", "name": "Croatian"}
  ]
}
```

## 🚀 Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions including:

- Docker containerization
- Nginx configuration
- SSL setup
- Environment configuration
- Monitoring and logging

### Quick Docker Deployment

```bash
# Build and run with docker-compose
docker-compose up -d
```

## 🧪 Development

### Backend Development

```bash
cd backend
source venv/bin/activate

# Run with auto-reload
python app.py

# Run tests (if available)
python -m pytest
```

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔍 Troubleshooting

### Common Issues

1. **Tesseract not found**
   - Ensure Tesseract is installed and in PATH
   - Install required language packs

2. **CORS errors**
   - Check frontend URL in backend CORS configuration
   - Ensure both servers are running

3. **LLM processing fails**
   - Verify OPENROUTER_API_KEY is set in `.env` file (not just environment variables)
   - Ensure API key is not a placeholder value (avoid `your-api-key-here`)
   - Check API quota and permissions at https://openrouter.ai/
   - Application will automatically fallback to OCR if LLM fails
   - Clear conflicting environment variables: `unset OPENROUTER_API_KEY` before restarting

4. **File upload issues**
   - Check file size limits (16MB default)
   - Verify supported file formats

### Debugging

```bash
# Backend logs
tail -f logs/app.log

# Enable debug mode
export FLASK_ENV=development

# Frontend development tools
# Open browser developer console for client-side debugging
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) for optical character recognition
- [OpenRouter](https://openrouter.ai/) for LLM API access
- [React](https://reactjs.org/) and [Flask](https://flask.palletsprojects.com/) communities

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for intelligent document processing**