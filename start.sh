#!/usr/bin/env bash
# Bring up the world: Minecraft server, one bridge per player, dashboard.
# Idempotent: running it again only starts what is not running.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
RUN="$ROOT/run"; mkdir -p "$RUN" "$ROOT/logs"
# name:api_port:viewer_port:teammate
PLAYERS=("alpha:3101:3007:beta" "beta:3102:3008:alpha")

(cd "$ROOT/server" && docker compose up -d >/dev/null)
echo -n "server "; until grep -q "Done (" <(docker logs mc-agents 2>&1); do echo -n .; sleep 2; done; echo ok

start_bg() { # name, command...
  local name=$1; shift
  if [[ -f "$RUN/$name.pid" ]] && kill -0 "$(cat "$RUN/$name.pid")" 2>/dev/null; then echo "$name already running"; return; fi
  # exec chain keeps $! equal to the node PID, so stop.sh kills the right process
  (cd "$ROOT/bridge" && exec nohup "$@" >"$ROOT/logs/$name.out" 2>&1 </dev/null) &
  echo $! >"$RUN/$name.pid"
  echo "$name started"
}

mkdir -p "$ROOT/agents/team"
[[ -f "$ROOT/agents/team/notes.md" ]] || printf '# Team notes (alpha + beta)\n\n' >"$ROOT/agents/team/notes.md"
for p in "${PLAYERS[@]}"; do
  IFS=: read -r name api viewer mate <<<"$p"
  dir="$ROOT/agents/$name"; mkdir -p "$dir/programs" "$dir/memory"
  sed -e "s|__NAME__|$name|g" -e "s|__MATE__|$mate|g" -e "s|__TEAM__|$ROOT/agents/team|g" -e "s|__BRIDGE__|$ROOT/bridge|g" -e "s|__GUIDES__|$ROOT/agents/guides|g" \
    "$ROOT/agents/AGENTS.template.md" >"$dir/AGENTS.md"
  printf '#!/bin/sh\nMC_BRIDGE_PORT=%s exec node %s/bridge/mc.js "$@"\n' "$api" "$ROOT" >"$dir/mc"; chmod +x "$dir/mc"
  [[ -f "$dir/memory/notes.md" ]] || printf '# %s notes\n\n## Now\nJust spawned. Nothing done yet.\n' "$name" >"$dir/memory/notes.md"
  start_bg "bot-$name" node bot.js --name "$name" --api "$api" --viewer "$viewer"
done
start_bg dashboard node dashboard.js --port 3100 --bots "alpha:3101:3007,beta:3102:3008"

for p in "${PLAYERS[@]}"; do
  IFS=: read -r name api _ _ <<<"$p"
  echo -n "$name "; until curl -s "localhost:$api/status" | grep -q '"online":true'; do echo -n .; sleep 1; done; echo online
done
echo "dashboard: http://localhost:3100"
