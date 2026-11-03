#!/usr/bin/env bash
# Build the articles: regenerate table bodies from the run data, then compile the English
# and Ukrainian PDFs with Tectonic (XeTeX). Output: paper/article-en.pdf, paper/article-uk.pdf.
# Usage: bash paper/tex/build.sh [en|uk|all]
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
PAPER=$(cd "$HERE/.." && pwd)
TECTONIC=${TECTONIC:-$(command -v tectonic || echo "$HOME/.local/bin/tectonic")}
which=${1:-all}
PYTHONDONTWRITEBYTECODE=1 python3 -I "$PAPER/scripts/gen_tables.py"
PYTHONDONTWRITEBYTECODE=1 python3 -I "$HERE/build_uk.py"
for lang in en uk; do
  [[ $which == all || $which == "$lang" ]] || continue
  (cd "$HERE/$lang" && "$TECTONIC" --keep-logs --outdir "$HERE/$lang" main.tex)
  cp "$HERE/$lang/main.pdf" "$PAPER/article-$lang.pdf"
  echo "built $PAPER/article-$lang.pdf"
done
