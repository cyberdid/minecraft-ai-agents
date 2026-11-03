#!/usr/bin/env python3
"""Numbers and tables of the paper, computed from the CSVs of extract.py/evidence.py.

Writes paper/data/derived/stats.json (every scalar quoted in the text) and the table
CSVs paper/data/derived/T*.csv that gen_tables.py turns into LaTeX and that
verify_tables.py checks the article against.
"""

import csv
import datetime as dt
import json
import re
import statistics
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DER = ROOT / "paper" / "data" / "derived"
AGENTS = ("alpha", "beta", "gamma", "delta")
AGENT_START = "2026-10-21T12:11:00Z"  # same as evidence.MAIN_START
MAIN_END = "2026-11-02T18:12:00Z"     # the operator stopped everything (18:11)
ACTIVE_GAP = dt.timedelta(minutes=5)  # programs closer than this belong to one stretch of play

DEATH_CAUSES = [  # (category, regex on the death message after the player name)
    ("ghast fireball", r"^was fireballed"),
    ("lava", r"^tried to swim in lava"),
    ("fire", r"^(burned to death|went up in flames|was burnt to a crisp|walked into fire)"),
    ("arrow", r"^was shot by"),
    ("melee mob", r"^was slain by"),
    ("explosion", r"^(was blown up|blew up)"),
    ("drowning", r"^drowned"),
    ("fall or void", r"^(fell|was doomed to fall|hit the ground)"),
    ("other", r"."),
]


def ts(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00"))


def read(name):
    return list(csv.DictReader(open(DER / name)))


def write(name, rows, fields):
    with open(DER / name, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def cause(msg):
    for cat, rx in DEATH_CAUSES:
        if re.search(rx, msg):
            return cat


def active_hours(programs):
    """Merge program intervals of all agents; gaps up to ACTIVE_GAP count as play."""
    spans = []
    for p in programs:
        end = ts(p["ts_utc"])
        start = end - dt.timedelta(seconds=float(p["seconds"] or 0))
        spans.append((start, end))
    spans.sort()
    total = dt.timedelta()
    cur_s, cur_e = None, None
    for s, e in spans:
        if cur_s is None:
            cur_s, cur_e = s, e
        elif s - cur_e <= ACTIVE_GAP:
            cur_e = max(cur_e, e)
        else:
            total += cur_e - cur_s
            cur_s, cur_e = s, e
    if cur_s is not None:
        total += cur_e - cur_s
    return total.total_seconds() / 3600


def coverage(root):
    """(first, last) UTC timestamp of every server log file (same files as extract.py)."""
    import gzip
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from extract import server_log_files
    out = []
    for f, day in server_log_files(root):
        op = gzip.open if f.name.endswith(".gz") else open
        times = [l[1:9] for l in op(f, "rt", errors="replace") if re.match(r"^\[\d\d:\d\d:\d\d\]", l)]
        if not times:
            continue
        end_day, prev = day, "00"
        for t in times:
            if t < prev:
                end_day = (dt.date.fromisoformat(end_day) + dt.timedelta(days=1)).isoformat()
            prev = t
        out.append((f"{day}T{times[0]}Z", f"{end_day}T{times[-1]}Z"))
    return out


def main():
    ev = read("server_events.csv")
    pr = read("programs.csv")
    ms = read("milestones.csv")
    st = {}

    # ---- phase boundaries of the main run, from the console commands --------
    fam = lambda c: ("time" if c["detail"].startswith("time") or "playersSleepingPercentage" in c["detail"]
                     else "query" if c["detail"].startswith("data_query") else c["detail"].split(":")[0])
    main_cmds = [c for c in ev if c["kind"] == "console_cmd" and AGENT_START <= c["ts_utc"] <= MAIN_END]
    first = lambda fams: next((c["ts_utc"] for c in main_cmds if fam(c) in fams), MAIN_END)
    b_start = first({"time"})
    # gamerule counts as assistance (keepInventory...) unless fam() mapped it to time
    c_start = first({"effect", "enchant", "give", "spawnpoint", "fill", "setblock", "summon", "gamemode", "gamerule"})
    d_start = first({"teleport", "damage", "advancement_grant", "kill"})
    phases = [("A", AGENT_START, b_start), ("B", b_start, c_start), ("C", c_start, d_start), ("D", d_start, MAIN_END)]
    st["phase_bounds"] = {p: [s, e] for p, s, e in phases}

    def phase_of(t):
        for p, s, e in phases:
            if s <= t < e:
                return p
        return None

    # ---- runs ------------------------------------------------------------
    by_log = defaultdict(list)
    for p in pr:
        by_log[p["log"]].append(p)
    deaths = [e for e in ev if e["kind"] == "death" and e["player"] in AGENTS]
    stops = sorted(e["ts_utc"] for e in ev if e["kind"] == "server_stop")
    run_rows = []
    windows = {}
    # Run windows: the archived pilot logs also hold the operator's infrastructure tests
    # (lib development between the pilots, tests on 21 Oct morning), so the agents'
    # windows are set from the launch and stop times recorded in the session.
    RUNS = {
        "pilot1": ("2026-10-20T19:00:00Z", "2026-10-20T19:15:00Z"),   # no guides, no skill library
        "pilot2": ("2026-10-20T19:56:00Z", "2026-10-20T20:43:00Z"),   # guides + lib v1; agents ended their turns at 20:42
        "main": (AGENT_START, MAIN_END),
    }
    for log, (s, e) in RUNS.items():
        ps = sorted((p for p in by_log[log] if s <= p["ts_utc"] <= e), key=lambda p: p["ts_utc"])
        windows[log] = (s, e)
        d = [x for x in deaths if s <= x["ts_utc"] <= e]
        agents = sorted({p["agent"] for p in ps})
        errs = sum(int(p["error"]) for p in ps)
        row = {"run": log, "start_utc": s, "end_utc": e, "agents": len(agents),
               "wall_hours": round((ts(e) - ts(s)).total_seconds() / 3600, 1),
               "active_hours": round(active_hours(ps), 1), "programs": len(ps),
               "error_share_pct": round(100 * errs / len(ps), 1), "deaths": len(d),
               "lib_share_pct": round(100 * sum(int(p["uses_lib"]) for p in ps) / len(ps), 1)}
        run_rows.append(row)
        st[f"run_{log}"] = row
    # pilot 2: the night the bots stood idle in the world after the agents ended their turns
    # The server log of 21 Oct 00:00-11:59 UTC is missing (log rotation over restarts), so
    # the idle night is counted from the bridge's own chat log (secondary source).
    idle = ("2026-10-20T20:43:00Z", "2026-10-21T04:58:00Z")
    chat = ROOT / "runs" / "run2-20261021" / "logs-and-stage1-tests" / "alpha" / "chat.jsonl"
    idle_deaths = 0
    for line in open(chat, encoding="utf-8"):
        r = json.loads(line)
        if idle[0] < r["t"] <= idle[1] and re.match(r"^(alpha|beta) (was |drowned|fell|burned|went up|tried to swim)", r["text"]):
            idle_deaths += 1
    st["pilot2_idle"] = {"from": idle[0], "to": idle[1], "source": str(chat.relative_to(ROOT)),
                         "hours": round((ts(idle[1]) - ts(idle[0])).total_seconds() / 3600, 1),
                         "deaths": idle_deaths,
                         "deaths_in_server_log": len([x for x in deaths if idle[0] < x["ts_utc"] <= idle[1]])}
    write("T_runs.csv", run_rows, list(run_rows[0].keys()))

    # ---- main run: per agent ----------------------------------------------
    main_pr = [p for p in by_log["main"] if p["ts_utc"] >= AGENT_START]
    main_deaths = [x for x in deaths if AGENT_START <= x["ts_utc"] <= MAIN_END]
    tokens = {r["agent"]: r for r in read("tokens.csv")} if (DER / "tokens.csv").exists() else {}
    ag_rows = []
    for a in AGENTS:
        ps = [p for p in main_pr if p["agent"] == a]
        secs = [float(p["seconds"]) for p in ps if p["seconds"]]
        t = tokens.get(a, {})
        ag_rows.append({
            "agent": a, "first_program_utc": min(p["ts_utc"] for p in ps)[:16] + "Z", "programs": len(ps),
            "error_share_pct": round(100 * sum(int(p["error"]) for p in ps) / len(ps), 1),
            "median_program_s": round(statistics.median(secs), 1),
            "obtain_share_pct": round(100 * sum(int(p["uses_obtain"]) for p in ps) / len(ps), 1),
            "deaths": len([x for x in main_deaths if x["player"] == a]),
            "model_steps": t.get("steps", ""), "output_mtok": t.get("output_mtok", ""),
        })
    write("T_agents.csv", ag_rows, list(ag_rows[0].keys()))
    st["main_programs"] = len(main_pr)
    st["main_error_share_pct"] = round(100 * sum(int(p["error"]) for p in main_pr) / len(main_pr), 1)
    st["main_median_program_s"] = round(statistics.median(float(p["seconds"]) for p in main_pr if p["seconds"]), 1)
    st["main_deaths"] = len(main_deaths)

    # ---- deaths by cause and phase -----------------------------------------
    dc = defaultdict(Counter)
    for x in main_deaths:
        dc[cause(x["detail"])][phase_of(x["ts_utc"])] += 1
    d_rows = []
    for cat, _ in DEATH_CAUSES:
        c = dc.get(cat, Counter())
        row = {"cause": cat, "A": c["A"], "B": c["B"], "C": c["C"], "D": c["D"], "total": sum(c.values())}
        if row["total"]:
            d_rows.append(row)
    d_rows.sort(key=lambda r: -r["total"])
    tot = {k: sum(r[k] for r in d_rows) for k in ("A", "B", "C", "D", "total")}
    d_rows.append({"cause": "total", **tot})
    write("T_deaths.csv", d_rows, ["cause", "A", "B", "C", "D", "total"])
    st["deaths_by_phase"] = tot
    # active hours per phase (deaths per active hour)
    st["active_hours_by_phase"] = {p: round(active_hours([q for q in main_pr if s <= q["ts_utc"] < e]), 1)
                                   for p, s, e in phases}

    # ---- program errors ---------------------------------------------------
    ec = Counter(p["error_class"] for p in main_pr if p["error"] == "1")
    n_err = sum(ec.values())
    e_rows = [{"error_class": k, "count": v, "share_of_errors_pct": round(100 * v / n_err, 1)} for k, v in ec.most_common()]
    write("T_errors.csv", e_rows, ["error_class", "count", "share_of_errors_pct"])
    st["main_errors"] = n_err

    # ---- console commands by family and phase ---------------------------------
    cc = defaultdict(Counter)
    for c in main_cmds:
        cc[fam(c)][phase_of(c["ts_utc"])] += 1
    c_rows = [{"family": f, "A": c["A"], "B": c["B"], "C": c["C"], "D": c["D"], "total": sum(c.values())}
              for f, c in sorted(cc.items(), key=lambda kv: -sum(kv[1].values()))]
    write("T_commands.csv", c_rows, ["family", "A", "B", "C", "D", "total"])
    st["console_commands_main"] = sum(r["total"] for r in c_rows)

    # ---- milestones with active hours since the agents started ---------------
    m_rows = []
    for m in ms:
        if not m["first_ts_utc"]:
            continue
        upto = [p for p in main_pr if p["ts_utc"] <= m["first_ts_utc"]]
        m_rows.append({**{k: m[k] for k in ("id", "milestone", "first_ts_utc", "agent", "level", "operator_helpers")},
                       "wall_hours": round((ts(m["first_ts_utc"]) - ts(AGENT_START)).total_seconds() / 3600, 1),
                       "active_hours": round(active_hours(upto), 1)})
    write("T_milestones.csv", m_rows, list(m_rows[0].keys()))
    st["milestone_levels"] = dict(Counter(m["level"] for m in m_rows))
    st["stage1_done_active_hours"] = next(r["active_hours"] for r in m_rows if r["id"] == "M07")
    st["stage1_done_wall_hours"] = next(r["wall_hours"] for r in m_rows if r["id"] == "M07")

    # ---- audit coverage: main-run programs that fall inside a stretch of server log --------
    cov = coverage(ROOT)
    inside = sum(1 for p in main_pr if any(a <= p["ts_utc"][:19] + "Z" <= b for a, b in cov))
    st["server_log_coverage"] = {"main_programs": len(main_pr), "inside": inside, "outside": len(main_pr) - inside,
                                 "missing_stretch": "2026-10-21T00:00Z..2026-10-21T11:59Z (pilot 2 idle night and tests)"}

    # ---- derived numbers quoted in the text ---------------------------------
    rate = {}
    for log in ("pilot1", "pilot2"):
        s_, e_ = RUNS[log]
        ps = [p for p in by_log[log] if s_ <= p["ts_utc"] <= e_]
        rate[log] = round(st[f"run_{log}"]["deaths"] / active_hours(ps), 1)
    for p_, s_, e_ in phases:
        h = active_hours([q for q in main_pr if s_ <= q["ts_utc"] < e_])
        rate[f"main_{p_}"] = round(st["deaths_by_phase"][p_] / h, 1) if h else None
    st["deaths_per_active_hour"] = rate
    nether = {"fire", "ghast fireball", "lava"}
    n_nether = sum(r["total"] for r in d_rows if r["cause"] in nether)
    st["nether_cause_deaths"] = {"count": n_nether, "share_pct": round(100 * n_nether / tot["total"], 1)}
    tk = read("tokens.csv")
    tin = sum(float(r["input_mtok"]) for r in tk)
    tca = sum(float(r["cached_mtok"]) for r in tk)
    st["tokens_main"] = {"model_steps": sum(int(r["steps"]) for r in tk), "input_uncached_mtok": round(tin, 1),
                         "cached_mtok": round(tca, 1), "cache_share_pct": round(100 * tca / (tca + tin), 1),
                         "output_mtok": round(sum(float(r["output_mtok"]) for r in tk), 2),
                         "thinking_mtok": round(sum(float(r["thinking_mtok"]) for r in tk), 2)}
    st["timeout_share_of_errors_pct"] = e_rows[0]["share_of_errors_pct"] if e_rows and e_rows[0]["error_class"] == "timeout" else None

    json.dump(st, open(DER / "stats.json", "w"), indent=1, sort_keys=True)
    print(json.dumps(st, indent=1, sort_keys=True))


if __name__ == "__main__":
    main()
