#!/usr/bin/env bash
# ==============================================================================
# ORVEN MEDIA - HLS Multi-bitrate Transcoding Script
# Converts input MP4 to HLS (.m3u8 + .ts segments) with adaptive bitrate streams
# ==============================================================================

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <input_video.mp4> <output_directory>"
  echo "Example: $0 input.mp4 /uploads/hls/anime-slug/ep-1"
  exit 1
fi

INPUT="$1"
OUT_DIR="$2"

if [ ! -f "$INPUT" ]; then
  echo "Error: Input file '$INPUT' does not exist."
  exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
  echo "Error: ffmpeg is not installed on the system."
  exit 1
fi

mkdir -p "$OUT_DIR"

echo ">>> Starting HLS multi-bitrate conversion for '$INPUT'..."
echo ">>> Output directory: '$OUT_DIR'"

# HLS Segment Duration (seconds)
SEGMENT_DURATION=4

ffmpeg -hide_banner -y -i "$INPUT" \
  -filter_complex \
  "[0:v]split=3[v1][v2][v3]; \
   [v1]scale=w=1920:h=1080:force_original_aspect_ratio=decrease[v1out]; \
   [v2]scale=w=1280:h=720:force_original_aspect_ratio=decrease[v2out]; \
   [v3]scale=w=854:h=480:force_original_aspect_ratio=decrease[v3out]" \
  -map "[v1out]" -c:v:0 libx264 -b:v:0 4500k -maxrate:v:0 4800k -bufsize:v:0 9000k -preset fast -g 48 -sc_threshold 0 \
  -map "[v2out]" -c:v:1 libx264 -b:v:1 2400k -maxrate:v:1 2600k -bufsize:v:1 4800k -preset fast -g 48 -sc_threshold 0 \
  -map "[v3out]" -c:v:2 libx264 -b:v:2 1200k -maxrate:v:2 1300k -bufsize:v:2 2400k -preset fast -g 48 -sc_threshold 0 \
  -map a:0 -c:a:0 aac -b:a:0 192k -ac 2 \
  -map a:0 -c:a:1 aac -b:a:1 128k -ac 2 \
  -map a:0 -c:a:2 aac -b:a:2 96k -ac 2 \
  -f hls \
  -hls_time "$SEGMENT_DURATION" \
  -hls_playlist_type vod \
  -hls_flags independent_segments \
  -hls_segment_type mpegts \
  -hls_segment_filename "$OUT_DIR/stream_%v_%03d.ts" \
  -master_pl_name master.m3u8 \
  -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" \
  "$OUT_DIR/stream_%v.m3u8"

echo "=========================================================="
echo ">>> HLS Transcoding Completed Successfully!"
echo ">>> Master Playlist: $OUT_DIR/master.m3u8"
echo "=========================================================="
