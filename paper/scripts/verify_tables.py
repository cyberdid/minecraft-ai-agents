#!/usr/bin/env python3
"""Check the master text against the run data. Exit code 1 on any mismatch.

1. Every <<Tn>> ... <</Tn>> block of paper/article-ua.txt must equal the table that
   gen_tables.py renders from the current CSVs (paper/tables/txt/Tn.txt).
2. Every number quoted in the prose (listed in CLAIMS with the stats.json key it
   comes from) must appear in the text exactly as the data gives it.

Missing data fails the check; nothing is skipped.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PAPER = ROOT / "paper"
TEXT = (PAPER / "article-ua.txt").read_text()
ST = json.load(open(PAPER / "data" / "derived" / "stats.json"))


def get(path):
    v = ST
    for k in path.split("."):
        v = v[k]
    return v


def ua(x, decimals=None):
    """Number as written in the Ukrainian text: decimal comma, thin grouping by space."""
    if decimals is not None:
        x = round(float(x), decimals)
        s = f"{x:.{decimals}f}"
    else:
        s = str(x)
    if "." in s:
        a, b = s.split(".")
    else:
        a, b = s, None
    if len(a) > 4:  # 13652 -> 13 652 ; 1922 stays
        a = f"{int(a):,}".replace(",", " ")
    return a + ("," + b if b is not None else "")


# (stats key, decimals or None, text that must contain the formatted number in place of {})
CLAIMS = [
    ("run_main.programs", None, "виконали {} програм ("),
    ("run_main.wall_hours", 0, "тривалістю {} календарні години"),
    ("run_main.active_hours", 1, "з яких {} години активної гри"),
    ("main_error_share_pct", 1, "({}% завершилися помилкою"),
    ("timeout_share_of_errors_pct", 1, "{}% помилок — таймаути"),
    ("main_deaths", None, "загинули {} рази"),
    ("stage1_done_active_hours", 1, "на рівні A за {} активної години"),
    ("nether_cause_deaths.share_pct", 1, "{}% смертей припадають"),
    ("tokens_main.model_steps", None, "витратила {} кроки"),
    ("tokens_main.input_uncached_mtok", 1, "{} млн незакешованих"),
    ("tokens_main.cached_mtok", 1, "ще {} млн з кешу"),
    ("tokens_main.cache_share_pct", 1, "з кешу, {}%"),
    ("tokens_main.output_mtok", 2, "{} млн вихідних"),
    ("tokens_main.thinking_mtok", 2, "{} млн токенів міркування"),
    ("run_pilot1.deaths", None, "За 15 хвилин — {} смертей"),
    ("deaths_per_active_hour.pilot1", 1, "({} на активну годину)"),
    ("run_pilot2.deaths", None, "{} смерті за активну гру"),
    ("pilot2_idle.hours", 1, "простояли {} години ночі"),
    ("pilot2_idle.deaths", None, "загинули {} рази; від будинку"),
    ("deaths_by_phase.A", None, "У фазі A — {} смертей"),
    ("active_hours_by_phase.A", 1, "смертей за {} активної години"),
    ("deaths_per_active_hour.main_A", 1, "({} на годину"),
    ("deaths_per_active_hour.main_B", 1, "у фазі B — {} на годину"),
    ("deaths_per_active_hour.main_C", 1, "у фазі C — {}."),
    ("nether_cause_deaths.count", None, "смертей основного прогону {} ("),
    ("main_errors", None, "{} із 3770 програм"),
    ("main_median_program_s", 1, "Медіанна програма триває {} с"),
    ("run_main.lib_share_pct", 1, "використовують {}% програм"),
    ("console_commands_main", None, "Разом {} консольна команда"),
    ("server_log_coverage.inside", None, "Покриття: {} із"),
]


def main():
    bad = []
    for f in sorted((PAPER / "tables" / "txt").glob("T*.txt")):
        tid = f.stem[1:]
        m = re.search(rf"<<T{tid}>>\n(.*?)\n<</T{tid}>>", TEXT, re.S)
        if not m:
            bad.append(f"T{tid}: block missing in article-ua.txt")
        elif m.group(1).strip() != f.read_text().strip():
            bad.append(f"T{tid}: table in the text differs from the data (run gen_tables.py)")
    for key, dec, pattern in CLAIMS:
        try:
            val = get(key)
        except KeyError:
            bad.append(f"{key}: missing in stats.json")
            continue
        want = pattern.format(ua(val, dec))
        if want not in TEXT:
            bad.append(f"{key} = {val}: text should contain «{want}»")
    if bad:
        print("FAIL")
        for b in bad:
            print("  -", b)
        sys.exit(1)
    print(f"OK: {len(list((PAPER / 'tables' / 'txt').glob('T*.txt')))} tables and {len(CLAIMS)} quoted numbers match the data")


if __name__ == "__main__":
    main()
