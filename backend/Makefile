PY ?= python3

.PHONY: ocr llm-ocr
ocr:
	@if [ -z "$(IMG)" ]; then echo "Usage: make ocr IMG=path/to/image.png [LANG=eng+hrv]"; exit 1; fi
	$(PY) scripts/ocr_to_md.py $(IMG) --lang $(or $(LANG),eng) --method ocr

llm-ocr:
	@if [ -z "$(IMG)" ]; then echo "Usage: make llm-ocr IMG=path/to/image.png [LANG=eng+hrv]"; exit 1; fi
	$(PY) scripts/ocr_to_md.py $(IMG) --lang $(or $(LANG),eng) --method llm

