#!/usr/bin/env python3
"""Figures of the paper (PDF for LaTeX, PNG for the README) from paper/data/derived.

F1 milestone timeline over active hours, coloured and lettered by evidence level
F2 deaths of the main run by cause, stacked by phase
F3 programs per calendar day, phase shown as a letter strip
F4 deaths per active hour: pilots vs phases of the main run

Level colours: categorical slots 1-4 of the reference palette (validated, adjacent CVD
dE >= 9.1). Two slots are below 3:1 contrast on white, so every mark carries its letter.
"""

import csv
import datetime as dt
import json
from collections import Counter
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
DER = ROOT / "paper" / "data" / "derived"
OUT = ROOT / "paper" / "figures"
OUT.mkdir(parents=True, exist_ok=True)

LEVEL = {"A": "#2a78d6", "B": "#eb6834", "C": "#1baf7a", "D": "#eda100"}
LEVEL_NAME = {"A": "A  autonomous", "B": "B  night skipping only", "C": "C  assisted (effects, gifts)", "D": "D  done by commands"}
INK, INK2, GRID = "#0b0b0b", "#52514e", "#e6e5e0"
ONE_HUE = "#2a78d6"

plt.rcParams.update({
    "font.family": "DejaVu Sans", "font.size": 9, "axes.edgecolor": INK2, "axes.labelcolor": INK2,
    "xtick.color": INK2, "ytick.color": INK2, "axes.spines.top": False, "axes.spines.right": False,
    "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.6, "axes.axisbelow": True,
    "figure.dpi": 150, "savefig.bbox": "tight",
})


def read(name):
    return list(csv.DictReader(open(DER / name)))


def save(fig, name):
    fig.savefig(OUT / f"{name}.pdf", metadata={"CreationDate": None})  # byte-identical rebuilds
    fig.savefig(OUT / f"{name}.png", dpi=200)
    plt.close(fig)


def f1_timeline():
    ms = read("T_milestones.csv")
    fig, ax = plt.subplots(figsize=(7.2, 4.2))
    ys = range(len(ms))[::-1]
    for y, m in zip(ys, ms):
        x = float(m["active_hours"])
        c = LEVEL[m["level"]]
        ax.plot([0, x], [y, y], color=GRID, lw=1.0, zorder=1)
        ax.scatter([x], [y], s=110, color=c, edgecolor="white", linewidth=2, zorder=3)
        ax.text(x, y, m["level"], ha="center", va="center", fontsize=6.5, color="white", weight="bold", zorder=4)
        ax.text(x + 0.35, y, f'{m["milestone"]}  ·  {m["agent"]}', va="center", fontsize=7.5, color=INK)
    ax.set_yticks([])
    ax.grid(axis="y", visible=False)
    ax.set_xlabel("active hours of play since the agents started (gaps over 5 min removed)")
    ax.set_xlim(0, max(float(m["active_hours"]) for m in ms) + 6)
    handles = [plt.Line2D([], [], marker="o", ls="", color=LEVEL[k], markersize=8, label=LEVEL_NAME[k]) for k in "ABCD"]
    ax.legend(handles=handles, loc="upper right", frameon=False, fontsize=7.5, title="evidence level", title_fontsize=7.5)
    ax.set_title("First time any agent reached each milestone (main run)", loc="left", fontsize=10, color=INK)
    save(fig, "F1_timeline")


def f2_deaths():
    rows = [r for r in read("T_deaths.csv") if r["cause"] != "total"][::-1]
    fig, ax = plt.subplots(figsize=(7.2, 3.4))
    left = [0] * len(rows)
    for k in "ABCD":
        vals = [int(r[k]) for r in rows]
        ax.barh([r["cause"] for r in rows], vals, left=left, color=LEVEL[k], edgecolor="white", linewidth=1.5,
                height=0.62, label=LEVEL_NAME[k])
        left = [a + b for a, b in zip(left, vals)]
    for i, r in enumerate(rows):
        ax.text(left[i] + 1.5, i, r["total"], va="center", fontsize=7.5, color=INK)
    ax.grid(axis="y", visible=False)
    ax.set_xlabel("deaths (all four agents)")
    ax.legend(loc="lower right", frameon=False, fontsize=7.5, title="phase", title_fontsize=7.5)
    ax.set_title("Deaths of the main run by cause and phase", loc="left", fontsize=10, color=INK)
    save(fig, "F2_deaths")


def f3_activity():
    st = json.load(open(DER / "stats.json"))
    pb = st["phase_bounds"]
    pr = [p for p in read("programs.csv") if p["log"] == "main" and p["ts_utc"] >= pb["A"][0]]

    def phase(t):
        for k in "DCBA":
            if t >= pb[k][0]:
                return k

    per = Counter((p["ts_utc"][:10], phase(p["ts_utc"])) for p in pr)
    d0 = dt.date.fromisoformat(pb["A"][0][:10])
    d1 = dt.date.fromisoformat(pb["D"][1][:10])
    days = [d0 + dt.timedelta(n) for n in range((d1 - d0).days + 1)]
    fig, ax = plt.subplots(figsize=(7.2, 2.8))
    bottom = [0] * len(days)
    for k in "ABCD":
        vals = [per.get((d.isoformat(), k), 0) for d in days]
        ax.bar(range(len(days)), vals, bottom=bottom, color=LEVEL[k], width=0.7, edgecolor="white", linewidth=1.5,
               label=LEVEL_NAME[k])
        bottom = [a2 + v for a2, v in zip(bottom, vals)]
    for i, v in enumerate(bottom):
        if v:
            ax.text(i, v + 12, str(v), ha="center", fontsize=7, color=INK2)
    ax.set_xticks(range(len(days)))
    ax.set_xticklabels([d.strftime("%d.%m") for d in days], fontsize=7)
    ax.set_ylabel("programs run")
    ax.grid(axis="x", visible=False)
    ax.legend(loc="upper left", frameon=False, fontsize=7, title="phase", title_fontsize=7)
    ax.set_title("Programs per day by phase; empty days: paused for the token quota", loc="left", fontsize=10, color=INK)
    save(fig, "F3_activity")


def f4_death_rate():
    st = json.load(open(DER / "stats.json"))
    r = st["deaths_per_active_hour"]
    bars = [("pilot 1\n(no guides)", r["pilot1"], None), ("pilot 2\n(guides + lib)", r["pilot2"], None)]
    for k in "ABC":
        if r.get(f"main_{k}") is not None:
            bars.append((f"main\nphase {k}", r[f"main_{k}"], k))
    fig, ax = plt.subplots(figsize=(5.2, 2.8))
    xs = range(len(bars))
    ax.bar(xs, [b[1] for b in bars], color=[LEVEL[b[2]] if b[2] else "#8a8986" for b in bars], width=0.6,
           edgecolor="white", linewidth=1.5)
    for x, b in zip(xs, bars):
        ax.text(x, b[1] + 0.6, f"{b[1]:.1f}", ha="center", fontsize=7.5, color=INK)
    ax.set_xticks(list(xs))
    ax.set_xticklabels([b[0] for b in bars], fontsize=7.5)
    ax.set_ylabel("deaths per active hour")
    ax.grid(axis="x", visible=False)
    ax.set_title("Death rate: pilots vs phases of the main run", loc="left", fontsize=10, color=INK)
    save(fig, "F4_death_rate")


if __name__ == "__main__":
    f1_timeline()
    f2_deaths()
    f3_activity()
    f4_death_rate()
    print("figures in", OUT)
