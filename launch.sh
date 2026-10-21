#!/usr/bin/env bash
# Everything at once: world + bridges + dashboard, then one terminal window per agent
# (each runs agent-loop.sh, the watchdog). MODEL=gemini-4-argon-high ./launch.sh to pick the model.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
"$ROOT/start.sh"
for name in alpha beta; do
  gnome-terminal --title="agent $name" -- bash -c "MODEL='${MODEL:-gemini-3.8-flash-high}' '$ROOT/agent-loop.sh' $name; exec bash"
done
xdg-open http://localhost:3100 >/dev/null 2>&1 || true
