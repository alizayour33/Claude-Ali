#!/bin/bash
# Installs everything the interactive-book-builder skill needs. Run: bash .claude/skills/interactive-book-builder/install.sh
set -euo pipefail
pip install -q pymupdf opencv-python-headless pytesseract numpy Pillow playwright
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq tesseract-ocr tesseract-ocr-ara tesseract-ocr-eng
mkdir -p "${FONTS_DIR:-/tmp/fonts}"
npm i -s --prefix "${FONTS_DIR:-/tmp/fonts}" @fontsource/cairo @fontsource/caveat three@0.160.0
echo "interactive-book-builder dependencies installed. In cloud sessions launch Python Playwright with executable_path=/opt/pw-browsers/chromium."
