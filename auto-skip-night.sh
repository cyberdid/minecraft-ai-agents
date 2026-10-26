#!/usr/bin/env bash
# auto-skip-night.sh: Automatically fast-forwards nighttime to day in real time
# without stopping or restarting the Minecraft server or agents.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$ROOT/run/auto-skip-night.pid"
LOG_FILE="$ROOT/logs/auto-skip-night.log"
mkdir -p "$ROOT/run" "$ROOT/logs"

echo $$ > "$PID_FILE"
echo "[$(date -Iseconds)] auto-skip-night started (PID $$)" >> "$LOG_FILE"

while true; do
  status=$(curl -s --max-time 3 http://localhost:3101/status 2>/dev/null || true)
  if [[ -n "$status" ]] && echo "$status" | grep -q '"timeOfDay"'; then
    timeOfDay=$(echo "$status" | jq -r '.timeOfDay // 0')
    # Minecraft night is from tick 12542 to 23460
    if [[ "$timeOfDay" -ge 12542 && "$timeOfDay" -lt 23460 ]]; then
      echo "[$(date '+%H:%M:%S')] Night detected (tick $timeOfDay). Skipping to dawn 23460..." >> "$LOG_FILE"
      docker exec -u minecraft mc-agents sh -c 'echo "time set 23460" > /proc/1/fd/5' 2>/dev/null || true
      sleep 10
    fi
  fi
  sleep 5
done
