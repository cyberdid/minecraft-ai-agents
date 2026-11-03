#!/usr/bin/env bash
# Rebuild every number, table, figure and PDF of the paper from the raw data, and check
# the master text against it. Writes a log of each step with its exit code, and SHA256SUMS.
# Usage: bash paper/scripts/run_all.sh      (from the repository root or anywhere)
set -euo pipefail
PAPER=$(cd "$(dirname "$0")/.." && pwd)
cd "$PAPER"
LOG="$PAPER/release/run_all.log"; mkdir -p "$PAPER/release"; : > "$LOG"
step() { echo "== $*" | tee -a "$LOG"; "$@" >>"$LOG" 2>&1; echo "   exit $?" | tee -a "$LOG"; }
export PYTHONDONTWRITEBYTECODE=1
step python3 -I scripts/extract.py        # raw logs -> data/derived/*.csv, manifest.csv (SHA-256 of inputs)
step python3 -I scripts/evidence.py       # milestones + evidence levels A-D, +K helpers
step python3 -I scripts/stats.py          # stats.json and table CSVs
step python3 -I scripts/gen_tables.py     # tables: txt (injected into article-ua.txt) and LaTeX en/uk
step python3 scripts/make_figures.py      # figures (needs matplotlib from the user site)
step python3 -I scripts/verify_tables.py  # every table and quoted number of article-ua.txt vs data
step bash tex/build.sh                    # article-en.pdf, article-uk.pdf (Tectonic)
(cd "$PAPER" && sha256sum article-ua.txt article-en.pdf article-uk.pdf data/derived/*.csv data/derived/stats.json figures/*.pdf > release/SHA256SUMS)
echo "done: see release/run_all.log and release/SHA256SUMS"
