# OCR Image to Markdown Converter

This project provides a powerful OCR (Optical Character Recognition) system that converts images containing text into markdown files using either traditional Tesseract OCR or advanced LLM vision models.

## Features

- **Dual OCR Methods**: Choose between Tesseract OCR or LLM vision models (Qwen2.5-VL-72B)
- Convert images (PNG, JPG, etc.) to markdown text files
- Support for multiple languages
- **Enhanced Accuracy**: LLM method provides superior text extraction and formatting
- Automatic text preprocessing and markdown formatting
- Simple Makefile interface for easy usage
- **OpenRouter Integration**: Access to state-of-the-art vision models via API

## Prerequisites

Before using the OCR functionality, ensure you have the following installed:

### System Requirements
- Python 3.6 or higher
- Tesseract OCR engine

### Install Tesseract OCR

**macOS (using Homebrew):**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**Windows:**
Download and install from [GitHub Tesseract releases](https://github.com/UB-Mannheim/tesseract/wiki)

### Python Dependencies

Install the required Python packages:

**For basic OCR functionality:**
```bash
pip install pillow pytesseract
```

**For LLM-enhanced OCR (recommended):**
```bash
pip install pillow pytesseract requests
```

## Usage

### Basic Usage

**Traditional OCR (Tesseract):**
```bash
make ocr IMG=path/to/your/image.png
```

**LLM-Enhanced OCR (Recommended):**
```bash
make llm-ocr IMG=path/to/your/image.png
```

Both methods will create a markdown file named `parsed-[image-name].md` in the same directory.

### Setting up LLM OCR

To use the enhanced LLM method, you need an OpenRouter API key:

1. **Get an API key** from [OpenRouter](https://openrouter.ai/)
2. **Set the environment variable:**
   ```bash
   export OPENROUTER_API_KEY='your-api-key-here'
   ```
   
   Or create a `.env` file in the project root:
   ```
   OPENROUTER_API_KEY=your-api-key-here
   ```

**Note:** If no API key is provided, the LLM method will automatically fall back to traditional OCR.

### Examples

**Convert a PNG image (Traditional OCR):**
```bash
make ocr IMG=screenshot.png
```

**Convert using LLM vision model:**
```bash
make llm-ocr IMG=screenshot.png
```

**Convert with specific language (English):**
```bash
make ocr IMG=document.jpg LANG=eng
make llm-ocr IMG=document.jpg LANG=eng
```

**Convert Croatian text:**
```bash
make ocr IMG=hrvatski_tekst.png LANG=hrv
make llm-ocr IMG=hrvatski_tekst.png LANG=hrv
```

**Convert mixed English and Croatian:**
```bash
make ocr IMG=mixed_text.png LANG=eng+hrv
make llm-ocr IMG=mixed_text.png LANG=eng+hrv
```

### Supported Languages

Common language codes for Tesseract:
- `eng` - English
- `hrv` - Croatian
- `deu` - German
- `fra` - French
- `spa` - Spanish
- `ita` - Italian
- `rus` - Russian
- `chi_sim` - Chinese Simplified
- `jpn` - Japanese
- `srb`- Serbian 

You can combine multiple languages using `+`:
```bash
LANG=eng+hrv+deu
```

### Available Make Targets

| Target | Description | Parameters | Method |
|--------|-------------|------------|--------|
| `ocr` | Convert image to markdown using Tesseract | `IMG` (required), `LANG` (optional, default: eng) | Traditional OCR |
| `llm-ocr` | Convert image to markdown using LLM vision model | `IMG` (required), `LANG` (optional, default: eng) | Enhanced LLM |

## File Structure

```
.
├── Makefile           # Main build file with OCR target
├── scripts/
│   └── ocr_to_md.py  # Python OCR script
└── README.md         # This documentation
```

## How It Works

### Traditional OCR Method (`make ocr`)
1. **Image Preprocessing**: Converts images to grayscale and applies auto-contrast
2. **Text Extraction**: Uses Tesseract OCR engine for text recognition
3. **Markdown Formatting**: Normalizes and formats the extracted text
4. **Output**: Saves result as `parsed-[original-filename].md`

### LLM Vision Method (`make llm-ocr`)
1. **Image Encoding**: Converts image to base64 format
2. **API Request**: Sends image to Qwen2.5-VL-72B vision model via OpenRouter
3. **Intelligent Extraction**: LLM analyzes image structure and extracts text with context
4. **Enhanced Formatting**: Produces well-structured markdown with preserved hierarchy
5. **Fallback**: Automatically falls back to traditional OCR if API fails

## Script Parameters

The underlying Python script (`scripts/ocr_to_md.py`) supports additional options:

**Traditional OCR:**
```bash
python3 scripts/ocr_to_md.py image.png --lang eng --method ocr --out custom_output.md
```

**LLM-Enhanced OCR:**
```bash
python3 scripts/ocr_to_md.py image.png --lang eng --method llm --out custom_output.md
```

### Parameters:
- `image` - Path to the input image file (required)
- `--lang` - Language code(s) for context (default: eng)
- `--method` - Processing method: `ocr` (Tesseract) or `llm` (vision model)
- `--out` - Custom output file path (optional)

## Troubleshooting

### Common Issues

**1. "pytesseract is required" error:**
```bash
pip install pytesseract
```

**2. "Pillow is required" error:**
```bash
pip install pillow
```

**3. "TesseractError: Failed loading language" error:**
- Make sure Tesseract is installed on your system
- Use standard language codes (e.g., `eng` not `en_US.UTF-8`)
- Check available languages: `tesseract --list-langs`

**4. Poor OCR accuracy:**
- **Try LLM method first**: `make llm-ocr` often provides better results
- Ensure the image has good contrast and resolution
- Try preprocessing the image manually (increase contrast, remove noise)
- Use appropriate language codes for the text content

**5. LLM OCR Issues:**
- **"OPENROUTER_API_KEY not set"**: Get an API key from [OpenRouter](https://openrouter.ai/)
- **"requests library required"**: Install with `pip install requests`
- **API timeouts**: The system will automatically fall back to traditional OCR

### Checking Tesseract Installation

Verify Tesseract is properly installed:
```bash
tesseract --version
tesseract --list-langs
```

## Tips for Better Results

### For LLM Method (Recommended)
1. **Try LLM first**: Generally provides superior accuracy and formatting
2. **Language Context**: Specify the correct language for better context understanding
3. **Complex Documents**: LLM excels with tables, structured content, and mixed layouts
4. **Handwriting**: LLM can often handle handwritten text better than traditional OCR

### For Traditional OCR Method
1. **Image Quality**: Use high-resolution, clear images with good contrast
2. **Language Selection**: Choose the correct language code(s) for your text
3. **File Formats**: PNG and JPG formats work well
4. **Text Layout**: Images with clean, well-spaced text produce better results
5. **Preprocessing**: Consider manual image enhancement for difficult cases

## Examples of Generated Output

**Traditional OCR:**
```bash
make ocr IMG=document.png LANG=eng
```

**LLM-Enhanced OCR (Better Results):**
```bash
make llm-ocr IMG=document.png LANG=eng
```

Both methods will create `parsed-document.md` with formatted markdown text. The LLM method typically produces:
- Better structure preservation
- More accurate text recognition
- Improved formatting of tables and lists
- Better handling of complex layouts

## API Costs

The LLM method uses OpenRouter's Qwen2.5-VL-72B model:
- **Cost**: Approximately $0.003-0.008 per image (depending on image size)
- **Accuracy**: Significantly higher than traditional OCR
- **Speed**: 5-15 seconds per image
- **Fallback**: Free traditional OCR if API fails

## License

This project uses open-source tools and libraries. Please refer to individual component licenses for details.