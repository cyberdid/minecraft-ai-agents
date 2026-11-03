#!/usr/bin/env python3
"""Generate paper/tex/uk/main.tex from the master text paper/article-ua.txt, so the
Ukrainian PDF can never drift from the text that verify_tables.py checks.

Conventions of the master text: a numbered upper-case line is a section, "6.2. Title. text"
a subsection with its first paragraph, lines starting with "— " a bullet list, "(a) " lines
the contribution list, <<Tn>> blocks the generated tables, "[n] " lines the references.
"""

import re
from pathlib import Path

PAPER = Path(__file__).resolve().parents[1]
SRC = (PAPER / "article-ua.txt").read_text()

# The master text writes the title in capitals; this is the same title in sentence case.
TITLE = ("Дешеві агенти-програмісти у виживанні Minecraft: перевірена бібліотека навичок, "
         "дванадцятиденний прогін чотирьох агентів Gemini~3.8~Flash і аудит кожної віхи за логом сервера")

TABLES = {  # caption, column spec, header
    "1": ("Прогони. Активні години — об'єднання інтервалів програм із проміжками до 5 хв; lib\\,\\% — частка програм, що викликають бібліотеку.",
          "@{}L rrrrrrr@{}", "прогін & агентів & год календ. & год активн. & програм & помилки \\% & смерті & lib \\%"),
    "2": ("Віхи основного прогону: коли будь-який агент досяг кожної вперше, рівень доказовості й кількість хелперів оператора вже у вжитку (+K).",
          "@{}l L l l r r c r@{}", "id & віха & вперше (UTC) & агент & год календ. & год активн. & рівень & хелпери опер."),
    "3": ("Консольні команди основного прогону за родинами й фазами.", "@{}L rrrrr@{}", "родина & A & B & C & D & разом"),
    "4": ("Смерті основного прогону за причинами й фазами.", "@{}L rrrrr@{}", "причина & A & B & C & D & разом"),
    "5": ("Програми з помилкою в основному прогоні за класами.", "@{}L rr@{}", "клас & програм & \\% від невдалих"),
    "6": ("Агенти основного прогону. Стовпці токенів — у мільйонах; кеш — вхідні токени з кешу контексту.",
          "@{}l l rrrrrrrrrr@{}", "агент & перша програма & прогр. & помил.\\,\\% & мед.\\,с & obtain\\,\\% & смерті & кроки & вх. & кеш & вих. & думання"),
    "7": ("Дефекти інфраструктури, знайдені під час тестів і прогону.", "@{}l l L L l@{}", "id & сфера & симптом & виправлення & де знайдено"),
}
FIGURES = {  # after which subsection number
    "6.2": [("F1_timeline.pdf", 1.0, "Коли будь-який агент уперше досяг кожної віхи, за активними годинами; колір і літера — рівень доказовості.")],
    "6.3": [("F3_activity.pdf", 1.0, "Програми за день за фазами. Дні без стовпчиків: гру зупинено через квоту токенів.")],
    "6.4": [("F2_deaths.pdf", 1.0, "Смерті основного прогону за причинами, з розподілом за фазами."),
            ("F4_death_rate.pdf", 0.72, "Смерті на активну годину в пілотах і фазах основного прогону (фаза D тривала 12 хвилин і не показана).")],
}


def esc(s):
    for a, b in [("\\", r"\textbackslash{}"), ("&", r"\&"), ("%", r"\%"), ("_", r"\_"), ("#", r"\#"), ("$", r"\$"),
                 ("{", r"\{"), ("}", r"\}"), ("~", r"\textasciitilde{}"), ("^", r"\^{}")]:
        s = s.replace(a, b)
    s = s.replace("«", "<<").replace("»", ">>")
    return s


def table(tid):
    cap, spec, head = TABLES[tid]
    env = "tabularx" if "L" in spec else "tabular"
    width = "{\\linewidth}" if env == "tabularx" else ""
    size = "\\footnotesize" if tid in ("6", "7") else "\\small"
    return (f"\\begin{{table}}[h]\\centering{size}\n\\caption{{{cap}}}\\label{{tab:T{tid}}}\n"
            + ("\\setlength{\\tabcolsep}{3pt}\n" if tid == "6" else "")
            + f"\\begin{{{env}}}{width}{{{spec}}}\\toprule\n{head} \\\\\\midrule\n\\gentable{{{tid}}}\\bottomrule\\end{{{env}}}\n\\end{{table}}\n")


def figures(after):
    out = ""
    for f, w, cap in FIGURES.get(after, []):
        out += f"\\begin{{figure}}[h]\\centering\n\\includegraphics[width={w}\\linewidth]{{{f}}}\n\\caption{{{esc(cap)}}}\n\\end{{figure}}\n"
    return out


def main():
    text = re.sub(r"<<T(\d+)>>.*?<</T\1>>", lambda m: f"@@TABLE{m.group(1)}@@", SRC, flags=re.S)
    paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    title = paras[1]
    author, aff1, aff2, orcid, email, date = paras[2].split("\n")[:6]
    body = []
    pending_fig = None
    i = 3
    refs = []
    while i < len(paras):
        p = paras[i]
        if p == "АНОТАЦІЯ":
            body.append("\\begin{abstract}\n\\noindent\n" + esc(paras[i + 1]) + "\n\\end{abstract}\n")
            i += 2
            continue
        m = re.match(r"^(Ключові слова|Межі доказовості|Заява про незалежність)[.:] (.*)$", p, re.S)
        if m:
            body.append(f"\\medskip\\noindent\\textbf{{{m.group(1)}.}} {esc(m.group(2))}\n")
            i += 1
            continue
        if p == "ЛІТЕРАТУРА":
            refs = paras[i + 1].split("\n")
            break
        m = re.match(r"^(\d+)\. ([А-ЯІЇЄҐ0-9 ,()ʼ'’-]+)$", p)
        if m:
            if pending_fig:
                body.append(figures(pending_fig))
                pending_fig = None
            body.append(f"\\section{{{esc(m.group(2).capitalize())}}}\n")
            i += 1
            continue
        m = re.match(r"^(\d+\.\d+)\. (.+?)\. (.*)$", p, re.S)  # title ends at the first ". " (lib.obtain has no space)
        if m:
            if pending_fig:
                body.append(figures(pending_fig))
            pending_fig = m.group(1)
            body.append(f"\\subsection{{{esc(m.group(2))}}}\n{esc(m.group(3))}\n")
            i += 1
            continue
        if p.startswith("@@TABLE"):
            body.append(table(re.match(r"@@TABLE(\d+)@@", p).group(1)))
            i += 1
            continue
        lines = p.split("\n")
        if all(l.startswith("— ") for l in lines[1:]) and len(lines) > 1:
            body.append(esc(lines[0]) + "\n\\begin{itemize}\n" + "".join(f"\\item {esc(l[2:])}\n" for l in lines[1:]) + "\\end{itemize}\n")
            i += 1
            continue
        if re.match(r"^\([a-f]\) ", p):
            items = []
            while i < len(paras) and re.match(r"^\([a-f]\) ", paras[i]):
                items.append(esc(paras[i][4:]))
                i += 1
            body.append("\\begin{enumerate}\\renewcommand{\\labelenumi}{(\\alph{enumi})}\n" + "".join(f"\\item {x}\n" for x in items) + "\\end{enumerate}\n")
            continue
        m = re.match(r"^([^.]{3,40})\. (.*)$", p, re.S)
        if m and not re.match(r"^\d", p) and len(m.group(1).split()) <= 5:
            body.append(f"\\paragraph{{{esc(m.group(1))}.}} {esc(m.group(2))}\n")
        else:
            body.append(esc(p).replace("\n", "\n\n") + "\n")
        i += 1
    if pending_fig:
        body.append(figures(pending_fig))
    bib = "\\begin{thebibliography}{9}\n" + "".join(
        f"\\bibitem{{r{n}}} {esc(r.split('] ', 1)[1])}\n" for n, r in enumerate(refs, 1)) + "\\end{thebibliography}\n"
    doc = (
        "% GENERATED by paper/tex/build_uk.py from paper/article-ua.txt. Do not edit by hand.\n"
        "\\documentclass[11pt]{article}\n\\newcommand{\\tablelang}{uk}\n\\input{../preamble}\n"
        "\\addto\\captionsukrainian{\\renewcommand{\\refname}{Література}}\n"
        "\\hypersetup{pdftitle={Дешеві агенти-програмісти у виживанні Minecraft},pdfauthor={Олександр Пилипенко}}\n"
        "\\begin{document}\n\\selectlanguage{ukrainian}\n"
        f"\\title{{{TITLE}}}\n"
        f"\\author{{{esc(author)}\\\\[4pt]\\small {esc(aff1)}\\\\\\small {esc(aff2)}\\\\\\small {esc(orcid)}\\\\"
        f"\\small\\href{{mailto:{email}}}{{\\texttt{{{esc(email)}}}}}}}\n\\date{{{esc(date)}}}\n\\maketitle\n"
        + "\n".join(body) + "\n" + bib + "\\end{document}\n")
    (PAPER / "tex" / "uk" / "main.tex").write_text(doc)
    print("wrote tex/uk/main.tex")


if __name__ == "__main__":
    main()
