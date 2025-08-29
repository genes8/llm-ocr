#!/usr/bin/env python3
import argparse
import base64
import os
from pathlib import Path

try:
    from PIL import Image, ImageOps
except Exception as e:
    raise SystemExit("Pillow is required. Install with: pip install pillow")

try:
    import pytesseract
except Exception as e:
    raise SystemExit("pytesseract is required. Install with: pip install pytesseract")

try:
    import requests
except Exception as e:
    print("Warning: requests not available. LLM parsing will be disabled.")
    requests = None


def llm_to_markdown(image_path: Path, lang: str) -> str:
    """Use Qwen2.5-VL-72B vision model via OpenRouter to parse image content to markdown with better accuracy than OCR."""
    if not requests:
        raise SystemExit("requests library required for LLM parsing. Install with: pip install requests")
    
    # Convert image to base64
    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
    
    # Determine language context
    lang_context = {
        'hrv': 'Croatian',
        'eng': 'English', 
        'fra': 'French',
        'deu': 'German',
        'spa': 'Spanish',
        'ita': 'Italian'
    }.get(lang, 'English')
    
    # Load API key - prioritize .env file over potentially stale environment variables
    api_key = None
    
    # First try loading from .env file
    env_file = Path(__file__).parent.parent / '.env'
    if env_file.exists():
        try:
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('OPENROUTER_API_KEY='):
                        api_key = line.split('=', 1)[1].strip().strip('"\'')
                        # Skip placeholder values
                        if api_key and not api_key.startswith('your-') and api_key != 'your_api_key_here':
                            break
                        else:
                            api_key = None
        except Exception:
            pass  # Ignore file reading errors
    
    # If not found in .env or was a placeholder, try environment variable
    if not api_key:
        env_api_key = os.getenv('OPENROUTER_API_KEY')
        if env_api_key and not env_api_key.startswith('your-') and env_api_key != 'your_api_key_here':
            api_key = env_api_key
    
    if not api_key:
        print("Warning: OPENROUTER_API_KEY not set or contains placeholder value. Falling back to OCR.")
        print("To get an API key, visit: https://openrouter.ai/")
        print("Set it in .env file as: OPENROUTER_API_KEY=sk-or-v1-your-actual-key")
        return ocr_to_markdown(image_path, lang)
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://github.com/your-repo",  # Optional: for OpenRouter analytics
        "X-Title": "OCR Document Parser"  # Optional: for OpenRouter analytics
    }
    
    payload = {
        "model": "qwen/qwen-2-vl-72b-instruct",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"Please analyze this image and extract all text content into well-formatted Markdown. The document appears to be in {lang_context}. Preserve the original structure, headings, and formatting. Include all visible text, numbers, and maintain the document's hierarchy. Be thorough and accurate."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 2000,
        "temperature": 0.1  # Low temperature for more consistent, accurate text extraction
    }
    
    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()
        
        if 'choices' not in result or len(result['choices']) == 0:
            raise Exception(f"Unexpected API response: {result}")
            
        return result['choices'][0]['message']['content'].strip() + "\n"
    except requests.exceptions.Timeout:
        print("LLM parsing timed out. Falling back to OCR.")
        return ocr_to_markdown(image_path, lang)
    except requests.exceptions.RequestException as e:
        print(f"LLM parsing failed with network error: {e}. Falling back to OCR.")
        return ocr_to_markdown(image_path, lang)
    except Exception as e:
        print(f"LLM parsing failed: {e}. Falling back to OCR.")
        return ocr_to_markdown(image_path, lang)


def ocr_to_markdown(image_path: Path, lang: str) -> str:
    img = Image.open(image_path)
    # light preprocessing: grayscale and auto-contrast
    img = ImageOps.grayscale(img)
    img = ImageOps.autocontrast(img)
    
    # Try OCR with specified language, fallback to English if language pack missing
    try:
        text = pytesseract.image_to_string(img, lang=lang or "eng")
    except pytesseract.TesseractError as e:
        if "Failed loading language" in str(e):
            print(f"Warning: Language '{lang}' not available. Falling back to English.")
            print(f"To install language packs on macOS: brew install tesseract-lang")
            text = pytesseract.image_to_string(img, lang="eng")
        else:
            raise e
    # Basic Markdown normalization
    lines = [ln.rstrip() for ln in text.splitlines()]
    # Collapse multiple empty lines
    md_lines = []
    empty = 0
    for ln in lines:
        if ln.strip():
            empty = 0
            md_lines.append(ln)
        else:
            empty += 1
            if empty < 2:
                md_lines.append("")
    md = "\n".join(md_lines).strip() + "\n"
    return md


def main():
    ap = argparse.ArgumentParser(description="OCR an image and write Markdown")
    ap.add_argument("image", type=Path, help="Path to the image file")
    ap.add_argument("--lang", default="eng", help="Tesseract language(s), e.g., 'eng+hrv'")
    ap.add_argument("--out", type=Path, default=None, help="Output Markdown file path")
    ap.add_argument("--method", choices=["ocr", "llm"], default="ocr", help="Parsing method: ocr (tesseract) or llm (vision model)")
    
    try:
        args = ap.parse_args()
    except SystemExit as e:
        if e.code == 2:  # argparse error
            print("\nHint: If your file path contains spaces, make sure to quote it:")
            print('Example: python3 scripts/ocr_to_md.py "path with spaces/image.png"')
        raise

    if not args.image.exists():
        raise SystemExit(f"Image not found: {args.image}")

    if args.method == "llm":
        md = llm_to_markdown(args.image, args.lang)
    else:
        md = ocr_to_markdown(args.image, args.lang)
        
    out = args.out or args.image.with_name(f"parsed-{args.image.stem}.md")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(md, encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()

