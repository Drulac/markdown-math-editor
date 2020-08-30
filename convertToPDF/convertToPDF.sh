#!/bin/bash
input=$1

chromium --headless --disable-gpu --print-to-pdf="out-cli.pdf" "$input"

./cleanPDF.sh "out-cli.pdf" "out-cli.pdf"
