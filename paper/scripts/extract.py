#!/usr/bin/env python3
"""Turn the raw logs of the Minecraft agent runs into flat CSV tables.

Every number in the paper comes from these tables, and every table row can be
traced back to a line of a raw log (source file + line number).

Inputs (read-only):
  server/data/logs/*.log.gz, latest.log   the Minecraft server log (UTC): the ground truth
                                           for advancements, deaths and console commands
  logs/<agent>/programs.jsonl             every program an agent ran through the bridge
  logs/<agent>/agy.jsonl                  the agent's own turn stream (tokens per turn)
  runs/*/...                              the two pilot runs, archived

Outputs (paper/data/derived/):
  server_events.csv   one row per relevant server log line
  programs.csv        one row per program
  turns.csv           one row per finished agent turn
  manifest.csv        SHA-256 of every input file

Usage: python3 paper/scripts/extract.py [--root ~/Projects/Minecraft]
"""

import argparse
import csv
import gzip
import hashlib
import json
import re
from pathlib import Path

AGENTS = ("alpha", "beta", "gamma", "delta")
PLAYER = r"(alpha|beta|gamma|delta|cyberdid)"

# Death messages seen in these runs (vanilla 1.20 wording). Matched after "<player> ".
DEATH = re.compile(
    r"^(was |drowned|burned to death|went up in flames|tried to swim in lava|fell |"
    r"walked into fire|suffocated|blew up|hit the ground|starved|froze|experienced kinetic|"
    r"withered away|died|discovered the floor|didn't want to live)"
)

# Feedback lines of commands. These have no player name: in this setup they can only
# come from the server console (no player but the human spectator is operator).
COMMAND_FEEDBACK = [
    ("time", re.compile(r"^Set the time to ")),
    ("effect", re.compile(r"^Applied effect ")),
    ("teleport", re.compile(r"^Teleported ")),
    ("give", re.compile(r"^Gave ")),
    ("fill", re.compile(r"^(Successfully filled|No blocks were filled)")),
    ("kill", re.compile(r"^Killed ")),
    ("damage", re.compile(r"^Applied [0-9.]+ damage")),
    ("advancement_grant", re.compile(r"^Granted (the advancement|\d+ advancements)")),
    ("spawnpoint", re.compile(r"^Set (the world spawn point|spawn point)")),
    ("gamerule", re.compile(r"^Gamerule ")),
    ("enchant", re.compile(r"^Applied enchantment")),
    ("setblock", re.compile(r"^Changed the block")),
    ("data_query", re.compile(r"^.+ has the following entity data|^.+ has [0-9]+ experience")),
    ("gamemode", re.compile(r"^Set .*game mode")),
    ("summon", re.compile(r"^Summoned ")),
]

LINE = re.compile(r"^\[(\d\d:\d\d:\d\d)\] \[Server thread/INFO\]: (.*)$")


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def server_log_files(root):
    """Server logs in time order with the date each one starts on. The frozen copy in
    paper/data/raw/server-logs is used when present (latest.log is stored there under its
    date as 2026-11-02-9-latest.log); otherwise the live server/data/logs."""
    frozen = root / "paper" / "data" / "raw" / "server-logs"
    logs = frozen if frozen.exists() else root / "server" / "data" / "logs"
    out = [(p, p.name[:10]) for p in sorted(logs.glob("20*.log*"))]
    latest = logs / "latest.log"
    if latest.exists():  # live directory only
        import datetime as dt
        date = dt.datetime.fromtimestamp(latest.stat().st_mtime, dt.timezone.utc).strftime("%Y-%m-%d")
        out.append((latest, date))
    return out


def classify(msg):
    """kind, player, detail for one server message, or None if irrelevant."""
    m = re.match(r"^\[Not Secure\] \[Server\] (.*)$", msg) or re.match(r"^\[Server\] (.*)$", msg)
    if m:
        return "say", "", m.group(1)
    m = re.match(r"^(?:\[Not Secure\] )?<(\w+)> (.*)$", msg)
    if m:
        return "chat", m.group(1), m.group(2)
    m = re.match(rf"^{PLAYER} has (made the advancement|reached the goal|completed the challenge) \[(.+)\]$", msg)
    if m:
        return "advancement", m.group(1), m.group(3)
    m = re.match(rf"^{PLAYER} (joined|left) the game$", msg)
    if m:
        return m.group(2), m.group(1), ""
    m = re.match(rf"^\[{PLAYER}: (.*)\]$", msg)
    if m:  # a command typed by an operator in the game
        return "player_cmd", m.group(1), m.group(2)
    m = re.match(rf"^{PLAYER} (.*)$", msg)
    if m and DEATH.match(m.group(2)):
        return "death", m.group(1), m.group(2)
    for name, rx in COMMAND_FEEDBACK:
        if rx.match(msg):
            return "console_cmd", "", f"{name}: {msg}"
    if msg.startswith("Starting minecraft server version"):
        return "server_start", "", msg.rsplit(" ", 1)[-1]
    if msg.startswith("Stopping server"):
        return "server_stop", "", ""
    return None


def extract_server(root, out_dir, manifest):
    rows = []
    for path, date in server_log_files(root):
        manifest.append((str(path.relative_to(root)), sha256(path)))
        opener = gzip.open if path.name.endswith(".gz") else open
        day = date
        last_time = "00:00:00"
        with opener(path, "rt", encoding="utf-8", errors="replace") as f:
            for n, line in enumerate(f, 1):
                m = LINE.match(line.rstrip("\n"))
                if not m:
                    continue
                t, msg = m.groups()
                if t < last_time:  # the log crossed midnight
                    import datetime as dt
                    day = (dt.date.fromisoformat(day) + dt.timedelta(days=1)).isoformat()
                last_time = t
                c = classify(msg)
                if c:
                    kind, player, detail = c
                    rows.append({"ts_utc": f"{day}T{t}Z", "kind": kind, "player": player,
                                 "detail": detail, "source": str(path.relative_to(root)), "line": n})
    with open(out_dir / "server_events.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["ts_utc", "kind", "player", "detail", "source", "line"])
        w.writeheader()
        w.writerows(rows)
    return len(rows)


ERROR_CLASSES = [
    ("timeout", r"timed out after"),
    ("cancelled", r"cancelled"),
    ("craft_missing", r"cannot craft|missing ingredients|crafted only"),
    ("craft_glitch", r"updateSlot"),
    ("movement", r"movement failed|No path|Took to long|could not get there"),
    ("place", r"could not place|nothing solid next to|is occupied by"),
    ("not_found", r"found nothing|mined nothing|could not find|no \w+ (found|within)|No \w+ nearby"),
    ("reference", r"ReferenceError|is not defined"),
    ("type", r"TypeError"),
    ("syntax", r"SyntaxError"),
    ("bot_offline", r"not in the world|bot offline"),
    ("death", r"you died"),
]


def error_class(err):
    if not err:
        return ""
    for name, rx in ERROR_CLASSES:
        if re.search(rx, err):
            return name
    return "other"


def bridge_log_dirs(root):
    """(run label, agent, directory) for every bridge log directory."""
    dirs = []
    for agent in AGENTS:
        d = root / "logs" / agent
        if d.exists():
            dirs.append(("main", agent, d))
    for run_dir, label in [("runs/run1-20261020/logs", "pilot1"),
                           ("runs/run2-20261021/logs-and-stage1-tests", "pilot2"),
                           ("runs/stage1-aborted-1.20.4-1505/logs", "aborted")]:
        for agent in AGENTS:
            d = root / run_dir / agent
            if d.exists():
                dirs.append((label, agent, d))
    return dirs


def extract_programs(root, out_dir, manifest):
    rows = []
    for label, agent, d in bridge_log_dirs(root):
        p = d / "programs.jsonl"
        if not p.exists():
            continue
        manifest.append((str(p.relative_to(root)), sha256(p)))
        with open(p, encoding="utf-8") as f:
            for n, line in enumerate(f, 1):
                try:
                    r = json.loads(line)
                except json.JSONDecodeError:
                    continue
                code = r.get("code") or ""
                err = r.get("error") or ""
                rows.append({
                    "log": label, "agent": agent, "ts_utc": r.get("t", ""), "id": r.get("id"),
                    "seconds": r.get("seconds"), "timeout": r.get("timeout"),
                    "error": int(bool(err)), "error_class": error_class(err),
                    "uses_lib": int("lib." in code), "uses_obtain": int("lib.obtain" in code),
                    "code_chars": len(code), "source": str(p.relative_to(root)), "line": n,
                })
    fields = ["log", "agent", "ts_utc", "id", "seconds", "timeout", "error", "error_class",
              "uses_lib", "uses_obtain", "code_chars", "source", "line"]
    with open(out_dir / "programs.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    return len(rows)


KEY_ITEMS = ["stone_pickaxe", "iron_pickaxe", "iron_sword", "iron_chestplate", "shield", "bucket",
             "water_bucket", "white_bed", "diamond", "diamond_pickaxe", "obsidian", "flint_and_steel",
             "blaze_rod", "blaze_powder", "ender_pearl", "ender_eye"]


def extract_items(root, out_dir):
    """First time each key item shows up in an agent's inventory (status after a program).
    Worn armor is not in the inventory list, so armor pieces can appear late or never."""
    rows = []
    for label, agent, d in bridge_log_dirs(root):
        p = d / "programs.jsonl"
        if not p.exists():
            continue
        seen = {}
        with open(p, encoding="utf-8") as f:
            for n, line in enumerate(f, 1):
                try:
                    r = json.loads(line)
                except json.JSONDecodeError:
                    continue
                inv = ((r.get("status") or {}).get("inventory") or {})
                for item in KEY_ITEMS:
                    if item not in seen and inv.get(item):
                        seen[item] = (r.get("t", ""), inv[item], n)
        for item, (t, count, n) in seen.items():
            rows.append({"log": label, "agent": agent, "item": item, "first_ts_utc": t, "count": count,
                         "source": str(p.relative_to(root)), "line": n})
    rows.sort(key=lambda r: (r["log"], r["first_ts_utc"]))
    with open(out_dir / "items_first_seen.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["log", "agent", "item", "first_ts_utc", "count", "source", "line"])
        w.writeheader()
        w.writerows(rows)
    return len(rows)


def extract_turns(root, out_dir, manifest):
    """One row per finished agy turn (the 'result' event of the stream)."""
    rows = []
    for label, agent, d in bridge_log_dirs(root):
        p = d / "agy.jsonl"
        if not p.exists():
            continue
        manifest.append((str(p.relative_to(root)), sha256(p)))
        conv = ""
        with open(p, encoding="utf-8") as f:
            for n, line in enumerate(f, 1):
                if '"event":"init"' in line:
                    try:
                        conv = json.loads(line).get("conversation_id", "")
                    except json.JSONDecodeError:
                        pass
                    continue
                if '"event":"result"' not in line:
                    continue
                try:
                    r = json.loads(line)["result"]
                except (json.JSONDecodeError, KeyError):
                    continue
                u = r.get("usage") or {}
                rows.append({
                    "log": label, "agent": agent, "conversation": r.get("conversation_id") or conv,
                    "status": r.get("status"), "seconds": r.get("duration_seconds"),
                    "num_turns": r.get("num_turns"), "input_tokens": u.get("input_tokens"),
                    "cached_tokens": u.get("cache_read_tokens"), "output_tokens": u.get("output_tokens"),
                    "thinking_tokens": u.get("thinking_tokens"), "source": str(p.relative_to(root)), "line": n,
                })
    fields = ["log", "agent", "conversation", "status", "seconds", "num_turns", "input_tokens",
              "cached_tokens", "output_tokens", "thinking_tokens", "source", "line"]
    with open(out_dir / "turns.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    return len(rows)


def extract_tokens(root, out_dir):
    """Token use per agent from the per-step usage in the agent's own agy stream.
    Covers the main run only (the pilots ran agy interactively, without a stream)."""
    rows = []
    for label, agent, d in bridge_log_dirs(root):
        p = d / "agy.jsonl"
        if label != "main" or not p.exists():
            continue
        tot = {"input_tokens": 0, "cache_read_tokens": 0, "output_tokens": 0, "thinking_tokens": 0}
        steps = 0
        convs = set()
        with open(p, encoding="utf-8") as f:
            for line in f:
                if '"usage"' not in line and '"init"' not in line:
                    continue
                try:
                    e = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if e.get("event") == "init":
                    convs.add(e.get("conversation_id"))
                s = e.get("step_update") or {}
                u = s.get("usage")
                if u and s.get("state") == "DONE":
                    steps += 1
                    for k in tot:
                        tot[k] += u.get(k) or 0
        rows.append({"agent": agent, "steps": steps, "conversations": len(convs),
                     "input_mtok": round(tot["input_tokens"] / 1e6, 2), "cached_mtok": round(tot["cache_read_tokens"] / 1e6, 1),
                     "output_mtok": round(tot["output_tokens"] / 1e6, 2), "thinking_mtok": round(tot["thinking_tokens"] / 1e6, 2)})
    with open(out_dir / "tokens.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["agent", "steps", "conversations", "input_mtok", "cached_mtok", "output_mtok", "thinking_mtok"])
        w.writeheader()
        w.writerows(rows)
    return len(rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=str(Path(__file__).resolve().parents[2]))
    a = ap.parse_args()
    root = Path(a.root).expanduser().resolve()
    out_dir = root / "paper" / "data" / "derived"
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = []
    n_ev = extract_server(root, out_dir, manifest)
    n_pr = extract_programs(root, out_dir, manifest)
    n_tu = extract_turns(root, out_dir, manifest)
    n_it = extract_items(root, out_dir)
    extract_tokens(root, out_dir)
    with open(out_dir / "manifest.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["file", "sha256"])
        w.writerows(manifest)
    print(f"server_events: {n_ev} rows | programs: {n_pr} | turns: {n_tu} | items: {n_it} | inputs hashed: {len(manifest)}")


if __name__ == "__main__":
    main()
