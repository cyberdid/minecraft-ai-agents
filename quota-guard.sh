#!/usr/bin/env bash
# quota-guard.sh: Monitors Antigravity (agy) token quota.
# - Stops & saves the game if gemini-5h drops below 10% (0.10) or gemini-weekly drops below 5% (0.05).
# - If stopped due to gemini-5h (<10%) while gemini-weekly >= 5%, waits in background
#   and automatically resumes the game + 4 agents once gemini-5h recovers (>= 50%).
set -uo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$ROOT/run/quota-guard.pid"
LOG_FILE="$ROOT/logs/quota-guard.log"
STOP_THRESHOLD="${QUOTA_THRESHOLD:-0.10}"            # Stop 5h below 10%
WEEKLY_STOP_THRESHOLD="${WEEKLY_THRESHOLD:-0.05}"    # Stop weekly below 5%
RESUME_THRESHOLD="${QUOTA_RESUME:-0.50}"             # Resume once 5h quota recovers to >= 50%
ACTIVE_INTERVAL="${QUOTA_INTERVAL:-60}"              # Poll every 60s when game is running
PAUSED_INTERVAL="${QUOTA_PAUSED_INTERVAL:-120}"      # Poll every 120s when waiting for quota recovery

mkdir -p "$ROOT/run" "$ROOT/logs"

# Prevent duplicate quota-guard instances
if [[ -f "$PID_FILE" ]]; then
  old_pid=$(cat "$PID_FILE" 2>/dev/null || true)
  if [[ -n "$old_pid" && "$old_pid" != "$$" ]] && kill -0 "$old_pid" 2>/dev/null; then
    echo "[$(date -Iseconds)] quota-guard already running (PID $old_pid), exiting." >> "$LOG_FILE"
    exit 0
  fi
fi
echo $$ > "$PID_FILE"

is_game_running() {
  docker ps --format '{{.Names}}' 2>/dev/null | grep -qx 'mc-agents'
}

pause_game() {
  local reason="$1"
  echo "[$(date -Iseconds)] ⚠️ QUOTA LIMIT REACHED (<10%): $reason. Saving and pausing game..." >> "$LOG_FILE"
  docker exec -u minecraft mc-agents sh -c 'echo "say [QuotaGuard] Token limit <10% reached. Saving and pausing server..." > /proc/1/fd/5' 2>/dev/null || true
  docker exec -u minecraft mc-agents sh -c 'echo "save-all flush" > /proc/1/fd/5' 2>/dev/null || true
  sleep 3
  rm -f "$PID_FILE"
  "$ROOT/stop-agents.sh" >> "$LOG_FILE" 2>&1 || true
  "$ROOT/stop.sh" --all >> "$LOG_FILE" 2>&1 || true
  echo $$ > "$PID_FILE"
  DISPLAY=:1 notify-send "Minecraft AI Agents" "Гру збережено і призупинено: $reason" 2>/dev/null || true
  echo "[$(date -Iseconds)] ✅ Game saved and paused cleanly." >> "$LOG_FILE"
}

resume_game() {
  local summary="$1"
  echo "[$(date -Iseconds)] 🚀 QUOTA RECOVERED ($summary). Starting server and 4 agents..." >> "$LOG_FILE"
  rm -f "$ROOT/run/STOP-"*
  "$ROOT/start.sh" >> "$LOG_FILE" 2>&1 || true
  echo $$ > "$PID_FILE"
  for name in alpha beta gamma delta; do
    DISPLAY=:1 gnome-terminal --title="agent $name" -- bash -c "MODEL='${MODEL:-gemini-3.8-flash-high}' '$ROOT/agent-loop.sh' $name; exec bash" &
  done
  DISPLAY=:1 notify-send "Minecraft AI Agents" "Квоту відновлено ($summary)! Гру та 4 агентів автоматично перезапущено." 2>/dev/null || true
  echo "[$(date -Iseconds)] ✅ Game and all 4 agents resumed." >> "$LOG_FILE"
}

echo "[$(date -Iseconds)] quota-guard started (PID $$, 5h_stop<${STOP_THRESHOLD}, weekly_stop<${WEEKLY_STOP_THRESHOLD}, resume>=${RESUME_THRESHOLD})" >> "$LOG_FILE"

while true; do
  usage_json=$(agy -p /usage --output-format json 2>/dev/null || true)
  if [[ -n "$usage_json" ]]; then
    parsed=$(python3 -c '
import sys, json
try:
    data = json.loads(sys.stdin.read())
    groups = data.get("command", {}).get("data", {}).get("groups", [])
    bmap = {}
    for g in groups:
        for b in g.get("buckets", []):
            bmap[b.get("id", "")] = b
    w = float(bmap.get("gemini-weekly", {}).get("remaining_fraction", 1.0))
    h = float(bmap.get("gemini-5h", {}).get("remaining_fraction", 1.0))
    h_reset = bmap.get("gemini-5h", {}).get("reset_time", "")
    print(f"OK|{w:.4f}|{h:.4f}|{h_reset}")
except Exception as e:
    print(f"ERR|1.0|1.0|{e}")
' <<< "$usage_json" 2>/dev/null || echo "ERR|1.0|1.0|parse_error")

    IFS='|' read -r status w_frac h_frac h_reset <<< "$parsed"
    if [[ "$status" == "OK" ]]; then
      summary=$(python3 -c "print(f'gemini-weekly={float(\"$w_frac\")*100:.2f}% gemini-5h={float(\"$h_frac\")*100:.2f}% (reset: $h_reset)')")
      decision=$(python3 -c "
w = float('$w_frac')
h = float('$h_frac')
stop_t = float('$STOP_THRESHOLD')
w_stop_t = float('$WEEKLY_STOP_THRESHOLD')
resume_t = float('$RESUME_THRESHOLD')
if w < w_stop_t:
    print('STOP_WEEKLY')
elif h < stop_t:
    print('PAUSE_5H')
elif h >= resume_t and w >= w_stop_t:
    print('CAN_RESUME')
else:
    print('HOLD')
")
      if is_game_running; then
        if [[ "$decision" == "STOP_WEEKLY" ]]; then
          pause_game "gemini-weekly < 5% ($summary)"
          echo "[$(date -Iseconds)] 🛑 Weekly quota < 5%. Exiting quota-guard." >> "$LOG_FILE"
          rm -f "$PID_FILE"
          exit 0
        elif [[ "$decision" == "PAUSE_5H" ]]; then
          pause_game "gemini-5h < 10% ($summary)"
          sleep "$PAUSED_INTERVAL"
          continue
        else
          echo "[$(date '+%H:%M:%S')] [RUNNING] Quota OK: $summary" >> "$LOG_FILE"
          sleep "$ACTIVE_INTERVAL"
          continue
        fi
      else
        # Game is currently paused/stopped
        if [[ "$decision" == "STOP_WEEKLY" ]]; then
          echo "[$(date -Iseconds)] 🛑 Weekly quota < 5% ($summary). Exiting quota-guard." >> "$LOG_FILE"
          rm -f "$PID_FILE"
          exit 0
        elif [[ "$decision" == "CAN_RESUME" ]]; then
          resume_game "$summary"
          sleep "$ACTIVE_INTERVAL"
          continue
        else
          echo "[$(date '+%H:%M:%S')] [WAITING FOR QUOTA] $summary (resumes at gemini-5h >= $(python3 -c "print(f'{float(\"$RESUME_THRESHOLD\")*100:.0f}%')"))" >> "$LOG_FILE"
          sleep "$PAUSED_INTERVAL"
          continue
        fi
      fi
    fi
  fi
  sleep "$ACTIVE_INTERVAL"
done
