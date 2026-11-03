# Reproducing the paper

Everything in `article-ua.txt`, `article-en.pdf` and `article-uk.pdf` is rebuilt from the
raw data in this repository:

```bash
bash paper/scripts/run_all.sh
```

| step | script | reads | writes |
|---|---|---|---|
| 1 | `scripts/extract.py` | `data/raw/server-logs/` (frozen server log), `../logs/<agent>/` (bridge and agy logs), `../runs/` (pilots) | `data/derived/{server_events,programs,turns,items_first_seen,tokens,manifest}.csv` |
| 2 | `scripts/evidence.py` | the CSVs above | `data/derived/milestones.csv`, `operator_helpers.csv` |
| 3 | `scripts/stats.py` | the CSVs above | `data/derived/stats.json`, `T_*.csv` |
| 4 | `scripts/gen_tables.py` | `T_*.csv`, `data/defects.csv` | `tables/txt/`, `tex/tables/{en,uk}/`, the table blocks of `article-ua.txt` |
| 5 | `scripts/make_figures.py` | `T_*.csv`, `stats.json` | `figures/F1..F4.{pdf,png}` |
| 6 | `scripts/verify_tables.py` | `article-ua.txt`, `stats.json`, `tables/txt/` | exit 1 on any mismatch |
| 7 | `tex/build.sh` | `tex/en/main.tex`, `tex/uk/main.tex` (generated from `article-ua.txt` by `tex/build_uk.py`) | `article-en.pdf`, `article-uk.pdf` |

`data/derived/manifest.csv` lists every input file with its SHA-256; `release/SHA256SUMS`
the outputs; `release/ENVIRONMENT.txt` the exact tool versions.

Evidence levels (section 5 of the paper): **A** no console command before the milestone,
**B** only night skipping, **C** assistance (effects, enchantments, `keepInventory`, gifts,
block fills), **D** produced by commands (teleport, damage, kill, gift or advancement grant
within 15 minutes). **+K**: helpers added to `agents/team/autoload.js` by the operator's
supervising session during the run were already in use.

The server log of 2026-10-21 00:00–11:59 UTC is missing (log rotation over restarts); see
the paper's limitations.
