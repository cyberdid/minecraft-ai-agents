#!/usr/bin/env bash
# Save a copy of the world:   ./save.sh <name>      (list saves: ./save.sh)
# The server is stopped for the copy so the files are consistent, then started again if it was running.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"; SAVES="$ROOT/server/saves"; mkdir -p "$SAVES"
[[ $# -eq 0 ]] && { ls -1t "$SAVES"; exit 0; }
NAME=$1; [[ -e "$SAVES/$NAME" ]] && { echo "save '$NAME' already exists"; exit 1; }
running=$(docker ps -q -f name=^mc-agents$)
[[ -n $running ]] && (cd "$ROOT/server" && docker compose stop >/dev/null)
cp -a "$ROOT/server/data/world" "$SAVES/$NAME"
[[ -n $running ]] && (cd "$ROOT/server" && docker compose start >/dev/null)
echo "saved world as '$NAME' ($(du -sh "$SAVES/$NAME" | cut -f1))"
