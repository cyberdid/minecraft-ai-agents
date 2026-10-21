# Progression: what to make, in what order, from what

`lib.obtain(item, n)` does all of this by itself (see iron-age.md). This page
is the background: what things are made of, so you can plan and split work.

Exact Minecraft ids. Check any recipe with `lib.recipe('name')`. `lib.craft`
places a crafting table when a recipe needs one.

## First 10 minutes (one day is 20)

1. `lib.collect('*_log', 8)` → 8 logs
2. `lib.craft('oak_planks', 20)` (use the plank type of your logs:
   `birch_planks`, `spruce_planks`...) → 4 planks per log
3. `lib.ensureTable()` → places a crafting table near you
4. `lib.craft('stick', 8)`, `lib.craft('wooden_pickaxe', 1)`
5. `lib.collect('stone', 20)` → cobblestone (stone drops cobblestone; needs a pickaxe)
6. `lib.craft('stone_pickaxe', 1)`, `stone_sword`, `stone_axe`, `furnace`
7. `lib.collect('dirt', 16)` and keep it for shelters
8. Food: kill 2–3 animals, collect apples
9. Plan where to sleep before `night in` < 90 s (see survival.md)

## Recipes you will need

| Item | Needs | Makes | Table? |
|---|---|---|---|
| `*_planks` | 1 log of that wood | 4 | no |
| `stick` | 2 planks | 4 | no |
| `crafting_table` | 4 planks | 1 | no |
| `wooden_pickaxe` / `wooden_axe` | 3 planks + 2 sticks | 1 | yes |
| `wooden_sword` | 2 planks + 1 stick | 1 | yes |
| `stone_pickaxe` / `stone_axe` | 3 cobblestone + 2 sticks | 1 | yes |
| `stone_sword` | 2 cobblestone + 1 stick | 1 | yes |
| `stone_shovel` | 1 cobblestone + 2 sticks | 1 | yes |
| `furnace` | 8 cobblestone | 1 | yes |
| `chest` | 8 planks | 1 | yes |
| `oak_door` | 6 oak planks | **3** | yes |
| `torch` | 1 coal or charcoal + 1 stick | 4 | no |
| `white_bed` | 3 white wool + 3 planks | 1 | yes |
| `oak_slab` | 3 planks | 6 | yes |
| `oak_stairs` | 6 planks | 4 | yes |
| `oak_fence` | 4 planks + 2 sticks | 3 | yes |
| `ladder` | 7 sticks | 3 | yes |
| `glass` | smelt 1 `sand` | 1 | furnace |
| `glass_pane` | 6 glass | 16 | yes |
| `charcoal` | smelt 1 log | 1 | furnace |
| `stone` (smooth) | smelt 1 cobblestone | 1 | furnace |
| `stone_bricks` | 4 stone | 4 | no |
| `iron_ingot` | smelt 1 `raw_iron` | 1 | furnace |
| `iron_pickaxe` | 3 iron ingots + 2 sticks | 1 | yes |
| `shield` | 6 planks + 1 iron ingot | 1 | yes |
| `bucket` | 3 iron ingots | 1 | yes |
| `bread` | 3 wheat | 1 | yes |

Fuel for the furnace: 1 coal or charcoal smelts 8 items; 1 plank or log
smelts 1.5; a stick 0.5.

## Where things are

| Resource | Where | Tool |
|---|---|---|
| logs | trees on the surface | hand, axe faster |
| cobblestone | `stone` under dirt, hillsides, cave walls | any pickaxe |
| coal | `coal_ore` in exposed stone, often visible on hillsides | wooden pickaxe+ |
| iron | `iron_ore` (y 0–64, often in caves) | stone pickaxe+ |
| sand | beaches, deserts, river beds | hand/shovel |
| wool | sheep (white is common) | kill, or shears (2 iron) |
| food | cows, pigs, sheep, chickens; apples from oak leaves | sword |

Use `lib.find('coal_ore', {maxDistance: 64, count: 5})` before deciding to
dig. Ore deep underground is behind stone; `lib.collect` only takes blocks at
most 8 below you, to keep you out of caves.

## Material budgets for a first house

`lib.materials(lib.shapes.house({...}))` gives exact numbers. Rough sizes:

| House (inside width × depth × wall height) | Wall blocks | Roof (flat, overhang 1) |
|---|---|---|
| 5 × 5 × 3 | ~40 | 49 |
| 7 × 7 × 3 | ~60 | 81 |

So a 5×5 plank house needs ~90 planks ≈ 23 logs, or mix: cobblestone walls +
plank roof. Gather in one go during the day; split the gathering between
players.
