#!/usr/bin/env python3
"""Assign every milestone of the main run an evidence level from the server log.

A  no console command at all in the run before the milestone
B  only time changes before it: night skipping ("time set", the sleeping-percentage
   game rule) and read-only queries (experience, entity data)
C  assistance was active: status effects, enchantments, game rules, item gifts,
   block fills (portal rebuilding) happened in the run before it
D  the milestone itself was produced by commands: a teleport, damage, advancement
   grant or item gift within WINDOW minutes before it

The rule is mechanical so that anyone can re-run it on the same logs; the
evidence line (file:line of the first qualifying command) is written out.

A second, independent mark: +K when the agents had already used helpers that the
operator's supervising session added to team/autoload.js during the run (not part
of the declared skill library). The helper's first use comes from programs.csv.

Reads paper/data/derived/{server_events,items_first_seen}.csv (from extract.py).
Writes paper/data/derived/milestones.csv.
"""

import csv
import datetime as dt
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DER = ROOT / "paper" / "data" / "derived"

MAIN_START = "2026-10-21T12:11:00Z"  # agents launched; programs before this were infrastructure tests on alpha (see Limitations)
WINDOW = dt.timedelta(minutes=15)

# (id, label, kind, key): kind 'adv' = first advancement of that name by any agent,
# 'item' = first time the item is in any agent's inventory.
MILESTONES = [
    ("M01", "Stone tools", "adv", "Stone Age"),
    ("M02", "Iron pickaxe", "adv", "Isn't It Iron Pick"),
    ("M03", "First iron armor piece", "adv", "Suit Up"),
    ("M04", "Slept in a bed", "adv", "Sweet Dreams"),
    ("M05", "Diamonds", "adv", "Diamonds!"),
    ("M06", "Diamond pickaxe", "item", "diamond_pickaxe"),
    ("M07", "Obsidian (water on lava)", "adv", "Ice Bucket Challenge"),
    ("M08", "Flint and steel", "item", "flint_and_steel"),
    ("M09", "Entered the Nether", "adv", "We Need to Go Deeper"),
    ("M10", "Nether fortress", "adv", "A Terrible Fortress"),
    ("M11", "Blaze rod", "adv", "Into Fire"),
    ("M12", "Ender pearl", "item", "ender_pearl"),
    ("M13", "Eye of ender", "item", "ender_eye"),
    ("M14", "Stronghold portal room", "adv", "Eye Spy"),
    ("M15", "Entered the End", "adv", "The End?"),
    ("M16", "Ender dragon killed", "adv", "Free the End"),
]

# Helpers written into team/autoload.js by the operator's supervising agy session
# (attributed from that session's file writes; the agents did not define them).
OPERATOR_HELPERS = ["configureFireAvoidance", "makeObsidianSafe", "marchToSpawnerPillbox", "farmBlazeRodsAtPillbox",
                    "retreatToOverworldBase", "quickRegear", "enterNetherPortal", "passDoorOut", "passDoorIn",
                    "installBlockProtection", "isProtectedBlock", "clearFireAhead", "scoopWaterBlock", "safeEat",
                    "mineDryObsidian", "isProgramCancelled"]

ASSIST = {"effect", "enchant", "gamerule", "give", "spawnpoint", "fill", "setblock", "summon", "gamemode"}
TIME_ONLY_RULES = ("playersSleepingPercentage", "doDaylightCycle")


def family(c):
    """Command family; night-skipping game rules count as time, queries as harmless."""
    t = c["detail"].split(":")[0]
    if t == "gamerule" and any(r in c["detail"] for r in TIME_ONLY_RULES):
        return "time"
    if t == "data_query":
        return "query"
    return t
DIRECT = {"teleport", "damage", "advancement_grant", "give", "kill"}


def ts(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00"))


def main():
    events = [r for r in csv.DictReader(open(DER / "server_events.csv")) if r["ts_utc"] >= MAIN_START]
    items = [r for r in csv.DictReader(open(DER / "items_first_seen.csv")) if r["log"] == "main"]
    cmds = [r for r in events if r["kind"] == "console_cmd"]
    # first use of each operator helper in an agent program (main run); code is not in
    # programs.csv, so read the bridge logs directly
    import json
    helper_first = {}
    for agent in ("alpha", "beta", "gamma", "delta"):
        p = ROOT / "logs" / agent / "programs.jsonl"
        if not p.exists():
            continue
        for line in open(p, encoding="utf-8"):
            r = json.loads(line)
            if r.get("t", "") < MAIN_START:
                continue
            for h in OPERATOR_HELPERS:
                if h in (r.get("code") or "") and (h not in helper_first or r["t"] < helper_first[h]):
                    helper_first[h] = r["t"]
    with open(DER / "operator_helpers.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["helper", "first_used_utc"])
        for h in OPERATOR_HELPERS:
            w.writerow([h, helper_first.get(h, "")])
    rows = []
    for mid, label, kind, key in MILESTONES:
        if kind == "adv":
            hits = [r for r in events if r["kind"] == "advancement" and r["detail"] == key]
            first = min(hits, key=lambda r: r["ts_utc"]) if hits else None
            when, who, src = (first["ts_utc"], first["player"], f'{first["source"]}:{first["line"]}') if first else ("", "", "")
        else:
            hits = [r for r in items if r["item"] == key]
            first = min(hits, key=lambda r: r["first_ts_utc"]) if hits else None
            when, who, src = (first["first_ts_utc"][:19] + "Z", first["agent"], f'{first["source"]}:{first["line"]}') if first else ("", "", "")
        if not when:
            rows.append({"id": mid, "milestone": label, "first_ts_utc": "", "agent": "", "level": "not reached",
                         "operator_helpers": 0, "helpers_in_use": "", "commands_before": "", "evidence": "", "source": ""})
            continue
        t = ts(when)
        before = [c for c in cmds if ts(c["ts_utc"]) < t]
        types = sorted({family(c) for c in before})
        direct = [c for c in before if family(c) in DIRECT and t - ts(c["ts_utc"]) <= WINDOW]
        assist = [c for c in before if family(c) in ASSIST]
        if direct:
            level, ev = "D", direct[-1]
        elif assist:
            level, ev = "C", assist[0]
        elif before:
            level, ev = "B", before[0]
        else:
            level, ev = "A", None
        helpers = sorted(h for h, t0 in helper_first.items() if t0 < when)
        rows.append({"id": mid, "milestone": label, "first_ts_utc": when, "agent": who, "level": level,
                     "operator_helpers": len(helpers), "helpers_in_use": " ".join(helpers),
                     "commands_before": " ".join(types),
                     "evidence": f'{ev["source"]}:{ev["line"]} {ev["detail"][:80]}' if ev else "",
                     "source": src})
    with open(DER / "milestones.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["id", "milestone", "first_ts_utc", "agent", "level", "operator_helpers",
                                          "helpers_in_use", "commands_before", "evidence", "source"])
        w.writeheader()
        w.writerows(rows)
    for r in rows:
        print(f'{r["id"]} {r["milestone"]:<26} {r["first_ts_utc"]:<21} {r["agent"]:<6} {r["level"]:<2} K={r["operator_helpers"]} {r["helpers_in_use"]}')


if __name__ == "__main__":
    main()
