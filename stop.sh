#!/usr/bin/env bash
# Stop bridges and dashboard; `./stop.sh --all` also stops the Minecraft server.
# Agents run in their own terminals: close them (or Ctrl+C) yourself.
ROOT="$(cd "$(dirname "$0")" && pwd)"
for f in "$ROOT"/run/*.pid; do [[ -f $f ]] && kill "$(cat "$f")" 2>/dev/null && echo "stopped $(basename "$f" .pid)"; rm -f "$f"; done
pkill -f "node bot.js --name" 2>/dev/null || true
pkill -f "node dashboard.js --port" 2>/dev/null || true
pkill -f "[a]uto-skip-night.sh" 2>/dev/null || true
if [[ ${1:-} == --all ]]; then "$ROOT/stop-agents.sh"; (cd "$ROOT/server" && docker compose stop); fi
