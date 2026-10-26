#!/usr/bin/env bash
# Watchdog for one player agent: runs agy turn after turn in the same
# conversation, so the agent never just stops when it thinks it is done.
#   ./agent-loop.sh alpha        MODEL=gemini-4-argon-high ./agent-loop.sh beta
# Stop it: ./stop-agents.sh (or touch run/STOP-<name>, it stops after the turn).
# WARNING: --dangerously-skip-permissions lets the agent run any shell command as you.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
NAME=${1:?usage: ./agent-loop.sh alpha|beta|gamma|delta}
MODEL=${MODEL:-gemini-3.8-flash-high}
case "$NAME" in
  alpha) PORT=3101 ;;
  beta)  PORT=3102 ;;
  gamma) PORT=3103 ;;
  delta) PORT=3104 ;;
  *) echo "unknown agent: $NAME" >&2; exit 1 ;;
esac
LOGS="$ROOT/logs/$NAME"; RUN="$ROOT/run"; mkdir -p "$LOGS" "$RUN"
CONV_FILE="$RUN/$NAME.conversation"
STOP="$RUN/STOP-$NAME"; rm -f "$STOP"
echo $$ >"$RUN/agent-$NAME.pid"
cd "$ROOT/agents/$NAME"

KICKOFF=${KICKOFF:-"You are $NAME. Read AGENTS.md in this directory and all the guides it lists, then start playing. Keep going without asking me anything."}
MAX_TURNS=${MAX_TURNS:-0} # 0 = no limit

continue_prompt() {
  local status
  status=$(curl -s --max-time 5 "localhost:$PORT/status" | jq -r 'if .online then "\(.position) \(.dimension) | health \(.health) food \(.food) | \(.phase) | night in \(.secondsUntilNight)s | hostiles: \(.hostiles|join(", "))" elif .parked then "parked (logged out while idle; your next ./mc command logs you back in)" else "offline" end' 2>/dev/null)
  cat <<EOF
[watchdog, turn $1] Your previous turn ended. The objective is not finished and never is: there is always a next milestone. Keep playing.
Current status: ${status:-unknown}
Before acting: read the ## Now section of memory/notes.md and the team notes, check the chat (any ./mc command shows it), then continue with the next step. Update ## Now before your turn ends.
EOF
}

turn=0; backoff=30
while [[ ! -f $STOP ]]; do
  turn=$((turn + 1))
  [[ $MAX_TURNS -gt 0 && $turn -gt $MAX_TURNS ]] && break
  conv=$(cat "$CONV_FILE" 2>/dev/null || true)
  if [[ -z $conv ]]; then args=(-p "$KICKOFF"); else args=(--conversation "$conv" -p "$(continue_prompt $turn)"); fi
  echo -e "\n\033[1m=== $NAME · turn $turn · $(date +%H:%M:%S) · ${conv:-new conversation} ===\033[0m"
  agy --model "$MODEL" --dangerously-skip-permissions \
      --add-dir "$ROOT/agents/team" --add-dir "$ROOT/agents/guides" \
      --output-format stream-json "${args[@]}" 2>>"$LOGS/agy-stderr.log" \
    | tee -a "$LOGS/agy.jsonl" \
    | node "$ROOT/bridge/pretty.js" "$NAME" "$LOGS/usage.jsonl"
  code=${PIPESTATUS[0]}
  # remember the conversation for the next turn
  id=$(tac "$LOGS/agy.jsonl" | grep -m1 '"event":"init"' | jq -r .conversation_id 2>/dev/null)
  [[ -n $id && $id != null ]] && echo "$id" >"$CONV_FILE"
  last=$(tac "$LOGS/agy.jsonl" | grep -m1 '"event":"result"' | jq -r .result.status 2>/dev/null)
  if [[ $code -ne 0 || $last != SUCCESS ]]; then
    echo -e "\033[31m$NAME: turn failed (exit $code, status ${last:-none}); see logs/$NAME/agy-stderr.log. Retrying in ${backoff}s\033[0m"
    tail -n 3 "$LOGS/agy-stderr.log" 2>/dev/null
    sleep "$backoff"; backoff=$((backoff * 2 > 900 ? 900 : backoff * 2))
    # a conversation that keeps failing is dropped; the notes carry the state
    [[ $backoff -ge 480 ]] && rm -f "$CONV_FILE"
  else
    backoff=30; sleep 3
  fi
done
[[ -f $STOP ]] && echo "$NAME: stopped by $STOP" || echo "$NAME: stopped after $MAX_TURNS turns"
rm -f "$RUN/agent-$NAME.pid"
