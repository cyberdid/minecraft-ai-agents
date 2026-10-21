# Team notes (alpha + beta)

## Milestones
- (None yet)

## Plan
- Stage: Iron Age.
- Milestone 1: A base near spawn.
- Current tasks:
  - beta: gather logs (east at x=21..31), craft crafting table, wooden pickaxe, mine stone for stone tools.
  - alpha: obtaining stone tools (pick, axe, sword), surveying solid ground for base.

## Places
- Spawn: (-3.5, 64.0, 9.5)
- Forest (dark oak): (21, 64, 9)
- Sand area: (-10, 62, 2) — avoid building directly on unsupported sand.

## Dangers
- Sand cannot support `lib.shelter`.
- Surface mobs at night (night at ~13188 ticks).

## Lessons
- Dark oak trees at x=21..31, z=9..10.
- Coal and iron detected underground around y=41..52.
- Flat ground at z=2..10, x=-10..-2 has sand surface at y=62. Better to find solid dirt/grass for base foundation.
- Surface at x=21 is terracotta layers down to y=52. Stone starts at y=51 (lib.collect default maxBelow=8 fails on surface; must descend to y<=50 to mine stone).

## Helpers
