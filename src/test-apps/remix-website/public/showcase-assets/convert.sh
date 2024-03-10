#!/bin/bash

cd $(pwd)

shopt -s nullglob nocaseglob extglob

# Specify the directory containing the files

# Convert .mov to .mp4
for FILE in *.mov; do    
    # Convert .mov to .mp4 using ffmpeg
    ffmpeg -i "$FILE" "${FILE%.*}".mp4
    
    # Delete the original .mov file
    rm "$FILE"
done

WEBM_PARAMS=('-c:v libvpx-vp9 -crf 50')

# Convert .mp4 to .webm
for FILE in *.mp4; do
    # Check if the corresponding .webm file already exists
    if [ -f "${FILE%.*}.webm" ]; then
        echo "Skipping conversion of $FILE to .webm as the file already exists."
    else
        # Convert .mp4 to .webm using ffmpeg
        ffmpeg -i "$FILE" $WEBM_PARAMS "${FILE%.*}".webm
    fi
done

# Convert images to .webp

WEBP_PARAMS=('-m 6 -q 30 -mt -af -progress')

for FILE in *.@(jpg|jpeg|tif|tiff|png); do
    # Check if the corresponding .webp file already exists
    if [ -f "${FILE%.*}.webp" ]; then
        echo "Skipping conversion of $FILE to .webp as the file already exists."
    else
        # Convert .mp4 to .webp using ffmpeg
        cwebp $WEBP_PARAMS "$FILE" -o "${FILE%.*}".webp;
    fi
done