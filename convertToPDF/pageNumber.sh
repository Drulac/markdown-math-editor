#!/bin/bash
input="$1"
count=$2
blank=$((count - 1))
blank=0
output="${1%.pdf}-header.pdf"
pagenum=$(($(pdftk "$input" dump_data | grep "NumberOfPages" | cut -d":" -f2) - 1))

#echo "" | ps2pdf -sPAPERSIZE=a4 - pageblanche.pdf

#pdfjam pageblanche.pdf "$input" --outfile "emptyFirst.pdf"

#rm "pageblanche.pdf"

#input="emptyFirst.pdf"

(for i in $(seq 0 "$blank"); do echo; done) | enscript -L1 -B --output - | ps2pdf - > /tmp/pa$$.pdf
(for i in $(seq 0 "$pagenum"); do echo; done) | enscript --fancy-header=simple2 -a ${count}- -L1 -F Helvetica@8 --header="" --footer='|$%/$=|' --output - | ps2pdf - > /tmp/pb$$.pdf
pdfjoin --paper A4 --outfile /tmp/join$$.pdf /tmp/pa$$.pdf /tmp/pb$$.pdf &>/dev/null
#cat /tmp/join$$.pdf | pdftk "$input" multistamp - output "$output-tmp"

cat /tmp/join$$.pdf | pdftk - cat 2-end output "/dev/stdout" | pdfjam --keepinfo --trim "0mm 2mm 0mm -2mm" --clip true --outfile /dev/stdout | pdftk "$input" multistamp - output "$output-tmp"

rm /tmp/pa$$.pdf
rm /tmp/pb$$.pdf
rm /tmp/join$$.pdf

#rm "emptyFirst.pdf"

#pdftk "$output-tmp" cat 2-end output "$output"

mv "$output-tmp" "$output"

#rm "$output-tmp"
