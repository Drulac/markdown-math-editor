#!/bin/bash
input="$1"
output="$2"


pdfjam --keepinfo --trim "11mm 11mm 11mm 11mm" --clip true --outfile /dev/stdout "$input" | pdfjam --keepinfo --trim "-11mm -11mm -11mm -11mm" --clip true --outfile "$output"

./pageNumber.sh "$output" 1

mv "${output%.pdf}-header.pdf" "$output"

pdfjam --nup 2x1 --landscape --frame false --outfile "${output%.pdf}-2pp.pdf" "$output"

okular "$output"
