#!/usr/bin/env python3
"""Render every table of the paper from the run CSVs, in three forms:

  paper/tables/txt/T<n>.txt          plain-text tables pasted into article-ua.txt
  paper/tex/tables/{en,uk}/T<n>.tex  LaTeX row bodies included by main.tex

verify_tables.py re-renders the plain-text form and compares it with the tables
in article-ua.txt, so the text can never drift from the data.
"""

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DER = ROOT / "paper" / "data" / "derived"
TXT = ROOT / "paper" / "tables" / "txt"
TEX = ROOT / "paper" / "tex" / "tables"

MILESTONE_UK = {
    "Stone tools": "Кам'яні інструменти", "Iron pickaxe": "Залізна кирка", "First iron armor piece": "Перша залізна броня",
    "Slept in a bed": "Сон у ліжку", "Diamonds": "Алмази", "Diamond pickaxe": "Алмазна кирка",
    "Obsidian (water on lava)": "Обсидіан (вода на лаву)", "Flint and steel": "Кресало",
    "Entered the Nether": "Вхід у Незер", "Nether fortress": "Фортеця Незеру", "Blaze rod": "Стрижень іфрита",
    "Ender pearl": "Перли Енду", "Eye of ender": "Око Енду", "Stronghold portal room": "Кімната порталу в стронгхолді",
    "Entered the End": "Вхід в Енд", "Ender dragon killed": "Дракона Енду вбито",
}
RUN_NAME = {"pilot1": ("pilot 1 (no guides, no library)", "пілот 1 (без гайдів і бібліотеки)"),
            "pilot2": ("pilot 2 (guides + library v1)", "пілот 2 (гайди + бібліотека v1)"),
            "main": ("main run", "основний прогін")}
CAUSE_UK = {"fire": "вогонь", "ghast fireball": "вогняна куля гаста", "lava": "лава", "drowning": "утоплення",
            "arrow": "стріла", "fall or void": "падіння або порожнеча", "melee mob": "моб у ближньому бою",
            "explosion": "вибух", "other": "інше", "total": "разом"}
FAMILY_UK = {"fill": "fill (блоки)", "time": "time (час)", "effect": "effect (ефекти)", "enchant": "enchant (зачарування)",
             "gamerule": "gamerule (правила)", "spawnpoint": "spawnpoint (відродження)", "teleport": "teleport (телепорт)",
             "query": "query (лише читання)", "give": "give (видача)", "damage": "damage (урон)",
             "advancement_grant": "advancement grant (видача досягнення)", "kill": "kill (знищення)"}
ERROR_UK = {"timeout": "таймаут програми", "other": "інше", "movement": "рух/шлях", "craft_missing": "крафт: бракує інгредієнтів",
            "type": "TypeError у коді", "reference": "ReferenceError у коді", "not_found": "ресурс не знайдено",
            "place": "ставлення блоку", "bot_offline": "бот поза грою", "death": "смерть під час obtain", "craft_glitch": "збій крафту 1.20"}


def read(p):
    return list(csv.DictReader(open(p)))


def fmt(v):
    return str(v)


def tables():
    """id -> (caption_en, caption_uk, header_en, header_uk, rows_en, rows_uk)"""
    T = {}
    runs = read(DER / "T_runs.csv")
    T["1"] = ("Runs", "Прогони",
              ["run", "agents", "wall h", "active h", "programs", "errors %", "deaths", "lib %"],
              ["прогін", "агентів", "год календ.", "год активн.", "програм", "помилки %", "смерті", "lib %"],
              [[RUN_NAME[r["run"]][0], r["agents"], r["wall_hours"], r["active_hours"], r["programs"], r["error_share_pct"], r["deaths"], r["lib_share_pct"]] for r in runs],
              [[RUN_NAME[r["run"]][1], r["agents"], r["wall_hours"], r["active_hours"], r["programs"], r["error_share_pct"], r["deaths"], r["lib_share_pct"]] for r in runs])
    ms = read(DER / "T_milestones.csv")
    T["2"] = ("Milestones and evidence levels", "Віхи та рівні доказовості",
              ["id", "milestone", "first (UTC)", "agent", "wall h", "active h", "level", "op. helpers"],
              ["id", "віха", "вперше (UTC)", "агент", "год календ.", "год активн.", "рівень", "хелпери опер."],
              [[m["id"], m["milestone"], m["first_ts_utc"][:16].replace("T", " "), m["agent"], m["wall_hours"], m["active_hours"], m["level"], m["operator_helpers"]] for m in ms],
              [[m["id"], MILESTONE_UK[m["milestone"]], m["first_ts_utc"][:16].replace("T", " "), m["agent"], m["wall_hours"], m["active_hours"], m["level"], m["operator_helpers"]] for m in ms])
    cm = read(DER / "T_commands.csv")
    T["3"] = ("Console commands of the main run by family and phase", "Консольні команди основного прогону за родинами й фазами",
              ["family", "A", "B", "C", "D", "total"], ["родина", "A", "B", "C", "D", "разом"],
              [[c["family"].replace("_", " "), c["A"], c["B"], c["C"], c["D"], c["total"]] for c in cm],
              [[FAMILY_UK[c["family"]], c["A"], c["B"], c["C"], c["D"], c["total"]] for c in cm])
    de = read(DER / "T_deaths.csv")
    T["4"] = ("Deaths of the main run by cause and phase", "Смерті основного прогону за причинами й фазами",
              ["cause", "A", "B", "C", "D", "total"], ["причина", "A", "B", "C", "D", "разом"],
              [[d["cause"], d["A"], d["B"], d["C"], d["D"], d["total"]] for d in de],
              [[CAUSE_UK[d["cause"]], d["A"], d["B"], d["C"], d["D"], d["total"]] for d in de])
    er = read(DER / "T_errors.csv")
    T["5"] = ("Failed programs of the main run by error class", "Програми з помилкою в основному прогоні за класами",
              ["class", "programs", "% of failed"], ["клас", "програм", "% від невдалих"],
              [[e["error_class"].replace("_", " "), e["count"], e["share_of_errors_pct"]] for e in er],
              [[ERROR_UK[e["error_class"]], e["count"], e["share_of_errors_pct"]] for e in er])
    ag = read(DER / "T_agents.csv")
    tk = {t["agent"]: t for t in read(DER / "tokens.csv")}
    agent_rows = [[a["agent"], a["first_program_utc"][:16].replace("T", " "), a["programs"], a["error_share_pct"], a["median_program_s"],
                   a["obtain_share_pct"], a["deaths"], tk[a["agent"]]["steps"], tk[a["agent"]]["input_mtok"],
                   tk[a["agent"]]["cached_mtok"], tk[a["agent"]]["output_mtok"], tk[a["agent"]]["thinking_mtok"]] for a in ag]
    T["6"] = ("Agents of the main run", "Агенти основного прогону",
              ["agent", "first program (UTC)", "programs", "errors %", "median s", "obtain %", "deaths", "model steps", "in Mtok", "cached Mtok", "out Mtok", "think Mtok"],
              ["агент", "перша програма (UTC)", "програм", "помилки %", "медіана с", "obtain %", "смерті", "кроків моделі", "вх. Mtok", "кеш Mtok", "вих. Mtok", "думання Mtok"],
              agent_rows, agent_rows)  # numbers only: same rows in both languages
    dfc = read(ROOT / "paper" / "data" / "defects.csv")
    T["7"] = ("Defects of the infrastructure found during testing and the run", "Дефекти інфраструктури, знайдені під час тестів і прогону",
              ["id", "area", "symptom", "fix", "found in"], ["id", "сфера", "симптом", "виправлення", "де знайдено"],
              [[d["id"], d["area"], d["symptom_en"], d["fix_en"], d["found_by"]] for d in dfc],
              [[d["id"], d["area"], d["symptom_uk"], d["fix_uk"], d["found_by"]] for d in dfc])
    return T


def txt_table(cap, header, rows):
    cols = [header] + rows
    w = [max(len(str(r[i])) for r in cols) for i in range(len(header))]
    line = lambda r: "| " + " | ".join(str(c).ljust(w[i]) for i, c in enumerate(r)) + " |"
    return "\n".join([cap, line(header), "|" + "|".join("-" * (x + 2) for x in w) + "|"] + [line(r) for r in rows])


def tex_escape(s):
    s = str(s)
    for a, b in [("\\", r"\textbackslash{}"), ("&", r"\&"), ("%", r"\%"), ("_", r"\_"), ("#", r"\#"), ("$", r"\$"), ("{", r"\{"), ("}", r"\}")]:
        s = s.replace(a, b)
    return s


def tex_rows(rows):
    return "\n".join(" & ".join(tex_escape(c) for c in r) + r" \\" for r in rows) + "\n"


def main():
    TXT.mkdir(parents=True, exist_ok=True)
    for lang in ("en", "uk"):
        (TEX / lang).mkdir(parents=True, exist_ok=True)
    for tid, (cap_en, cap_uk, h_en, h_uk, r_en, r_uk) in tables().items():
        (TXT / f"T{tid}.txt").write_text(txt_table(f"Таблиця {tid}. {cap_uk}", h_uk, r_uk) + "\n")
        (TEX / "en" / f"T{tid}.tex").write_text(tex_rows(r_en))
        (TEX / "uk" / f"T{tid}.tex").write_text(tex_rows(r_uk))
    inject(ROOT / "paper" / "article-ua.txt")
    print("tables:", ", ".join(sorted(tables())))


def inject(article):
    """Replace every <<Tn>> ... <</Tn>> block of the master text with the current table."""
    import re
    s = article.read_text()
    for tid in tables():
        block = (TXT / f"T{tid}.txt").read_text().rstrip("\n")
        s, n = re.subn(rf"<<T{tid}>>.*?<</T{tid}>>", lambda m: f"<<T{tid}>>\n{block}\n<</T{tid}>>", s, flags=re.S)
        if n != 1:
            raise SystemExit(f"article-ua.txt: expected one <<T{tid}>> block, found {n}")
    article.write_text(s)


if __name__ == "__main__":
    main()
