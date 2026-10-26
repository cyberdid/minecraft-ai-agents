#!/usr/bin/env bash
# Start one player agent in the Antigravity CLI (interactive, so you can watch and step in).
#   ./agent.sh alpha      ./agent.sh beta      MODEL=gemini-3.8-flash-medium ./agent.sh alpha
# WARNING: --dangerously-skip-permissions lets the agent run any shell command as you.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
NAME=${1:?usage: ./agent.sh alpha|beta|gamma|delta}
MODEL=${MODEL:-gemini-3.8-flash-high}
cd "$ROOT/agents/$NAME"
exec agy --model "$MODEL" --dangerously-skip-permissions --add-dir "$ROOT/agents/team" --add-dir "$ROOT/agents/guides" \
  -i "You are $NAME. Read AGENTS.md in this directory and all six guides it lists, then start playing: check your status with ./mc status, say hello to your teammate in the game chat, agree on what to build, and start building. Keep going without asking me anything."
