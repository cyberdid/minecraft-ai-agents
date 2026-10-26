#!/usr/bin/env bash
# Stop the agent watchdogs: each finishes nothing more and exits; running agy turns are interrupted.
ROOT="$(cd "$(dirname "$0")" && pwd)"
for name in alpha beta gamma delta; do
  touch "$ROOT/run/STOP-$name"
  pidf="$ROOT/run/agent-$name.pid"
  if [[ -f $pidf ]]; then pkill -P "$(cat "$pidf")" 2>/dev/null; kill "$(cat "$pidf")" 2>/dev/null; rm -f "$pidf"; echo "stopped agent $name"; fi
done
