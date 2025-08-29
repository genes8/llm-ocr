#!/usr/bin/env python3
"""
Flask API server for OCR processing
Integrates with existing ocr_to_md.py functionality
"""

import os
import tempfile
import uuid
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import logging

# Import our existing OCR functions
from scripts.ocr_to_md import ocr_to_markdown, llm_to_markdown

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all domains (configure more restrictively in production)
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])

# Configuration
UPLOAD_FOLDER = tempfile.mkdtemp()
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'pdf'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def cleanup_file(filepath):
    """Clean up uploaded file"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception as e:
        logger.warning(f"Failed to cleanup file {filepath}: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'llm-ocr-api'})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and return file info"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file or not file.filename or file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not supported'}), 400
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save file
        file.save(filepath)
        
        # Get file info
        file_size = os.path.getsize(filepath)
        
        return jsonify({
            'file_id': unique_filename,
            'original_name': filename,
            'size': file_size,
            'status': 'uploaded'
        })
    
    except Exception as e:
        logger.error(f"Upload error: {e}")
        return jsonify({'error': 'Upload failed'}), 500

@app.route('/api/process', methods=['POST'])
def process_ocr():
    """Process uploaded file with OCR or LLM"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        file_id = data.get('file_id')
        method = data.get('method', 'ocr')  # 'ocr' or 'llm'
        language = data.get('language', 'eng')
        
        if not file_id:
            return jsonify({'error': 'No file_id provided'}), 400
        
        # Find the uploaded file
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file_id)
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        try:
            # Process with appropriate method
            if method == 'llm':
                logger.info(f"Processing {file_id} with LLM method")
                markdown_content = llm_to_markdown(Path(filepath), language)
            else:
                logger.info(f"Processing {file_id} with OCR method")
                markdown_content = ocr_to_markdown(Path(filepath), language)
            
            # Parse the markdown content into structured data for frontend
            # This is a simple parser - can be enhanced based on needs
            lines = [line.strip() for line in markdown_content.split('\n') if line.strip()]
            
            # Extract basic information (this can be enhanced with better parsing)
            extracted_data = {
                'raw_text': markdown_content,
                'lines': lines,
                'method_used': method,
                'language': language,
                'file_id': file_id
            }
            
            return jsonify({
                'status': 'success',
                'data': extracted_data
            })
            
        except Exception as processing_error:
            logger.error(f"Processing error: {processing_error}")
            return jsonify({'error': f'Processing failed: {str(processing_error)}'}), 500
            
        finally:
            # Clean up the uploaded file
            cleanup_file(filepath)
    
    except Exception as e:
        logger.error(f"Process OCR error: {e}")
        return jsonify({'error': 'Processing request failed'}), 500

@app.route('/api/download/<file_id>', methods=['GET'])
def download_result(file_id):
    """Download processed markdown file"""
    try:
        # In a real implementation, you'd store the processed results
        # For now, return an error as we clean up files after processing
        return jsonify({'error': 'Download not available - files are processed and cleaned up immediately'}), 404
    
    except Exception as e:
        logger.error(f"Download error: {e}")
        return jsonify({'error': 'Download failed'}), 500

@app.route('/api/languages', methods=['GET'])
def get_available_languages():
    """Get list of available OCR languages"""
    return jsonify({
        'languages': [
            {'code': 'eng', 'name': 'English'},
            {'code': 'hrv', 'name': 'Croatian'},
            {'code': 'fra', 'name': 'French'},
            {'code': 'deu', 'name': 'German'},
            {'code': 'spa', 'name': 'Spanish'},
            {'code': 'ita', 'name': 'Italian'},
            {'code': 'eng+hrv', 'name': 'English + Croatian'}
        ]
    })

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({'error': 'File too large'}), 413

@app.errorhandler(404)
def not_found(e):
    """Handle not found error"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server error"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print(f"Starting OCR API server...")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print(f"Allowed file types: {ALLOWED_EXTENSIONS}")
    print(f"Max file size: {MAX_FILE_SIZE / (1024*1024):.1f}MB")
    
    # Run in development mode
    app.run(
        host='0.0.0.0',
        port=8000,
        debug=True
    )