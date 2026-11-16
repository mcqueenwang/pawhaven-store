#!/bin/bash
set -e
cd "$(dirname "$0")"
PORT="${PORT:-8000}"
echo "Starting PAWMOIRE local preview at http://127.0.0.1:${PORT}"
echo "Keep this window open while previewing. Press Control-C to stop."
python3 -m http.server "$PORT" --bind 127.0.0.1
