#!/usr/bin/env bash
# Replace the current world with a save:   ./load.sh <name>      ./load.sh --new  (fresh random world)
# Stop the agents first. The current world is kept as saves/autosave-before-load-<time>.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"; SAVES="$ROOT/server/saves"; mkdir -p "$SAVES"
NAME=${1:?usage: ./load.sh <name> | --new}
[[ $NAME != --new && ! -d "$SAVES/$NAME" ]] && { echo "no save '$NAME'"; ls -1t "$SAVES"; exit 1; }
"$ROOT/stop.sh" --all >/dev/null
[[ -d "$ROOT/server/data/world" ]] && mv "$ROOT/server/data/world" "$SAVES/autosave-before-load-$(date +%Y%m%d-%H%M%S)"
[[ $NAME != --new ]] && cp -a "$SAVES/$NAME" "$ROOT/server/data/world"
echo "loaded ${NAME/--new/a fresh world}; run ./start.sh or ./launch.sh"
