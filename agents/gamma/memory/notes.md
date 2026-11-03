# gamma notes

## Now
- **STAGE 7: MILESTONE 13 ACTIVE — THE OUTER END & ELYTRA EXPEDITION [TASK-136]**
- **Milestones 1–12 100% COMPLETE & VERIFIED**:
  - Milestones 1–7: Base, iron gear, beds, food, diamond pickaxe, lit Nether portal — 100% Complete.
  - Milestone 8: 11 Blaze Rods (22 `blaze_powder`) harvested from Spawner Pillbox by Gamma — 100% Complete.
  - Milestone 9: 22 Ender Pearls secured via Piglin bartering by Beta — 100% Complete.
  - Milestone 10: 18 Eyes of Ender crafted, Stronghold located at `(2240, 35, 1456)`, `[Eye Spy]` unlocked — 100% Complete.
  - Milestone 11: End Portal activated at `(2210, 0, 1470)`, `[The End?]` unlocked — 100% Complete.
  - Milestone 12: Ender Dragon defeated at Bedrock Perch `(3, 59, 0)`, `[Free the End]` unlocked, `[The Next Generation]` (Dragon Egg) goal achieved — 100% Complete!
- **Current Position & State**:
  - Stationed inside Base House at `(293.3, 72.0, -53.5)`.
  - Health: 20/20, Food: 20/20.
  - Inventory: `netherite_sword 100%`, `shield 89%`, `bow 100%` (with 7 arrows), `iron_pickaxe 80%`, `iron_sword 94%`, `cobblestone x11`.
  - 53 End Stone trophy blocks safely stored in Base Chest `(293, 72, -57)`.
  - Delta united with Gamma inside Base House `(295, 72, -54)`.
- **Milestone 13 Tactical Plan**:
  1. Secure 4+ Ender Pearls from team/chest for Gateway teleportation.
  2. Transit through End Portal `(2210, 0, 1470)` into `the_end`.
  3. Locate the newly generated End Gateway Portal near the outer rim of the Main End Island.
  4. Throw an Ender Pearl through the End Gateway to warp to Outer End Islands (`[Remote Getaway]`).
  5. Search Outer End Islands for an End City with End Ship to obtain Elytra wings (`[Sky's the Limit]`) and Shulker Shells (`[Great View From Up Here]`)!

## Key Insights for Nether Base Camp & Portal
- **Dimension Check Guard**:
  - Any loop intended for Nether or Overworld MUST verify `if (bot.game.dimension !== expectedDim) break;` on every iteration, preventing post-death waypoint wandering in the wrong dimension.
- **Soul Fire Hazard at (63, 65, -18)**:
  - Active soul fire blocks on the East Ridge trail between WP 3 `(63, 64, -7)` and WP 4 `(63, 65, -20)` deal rapid lethal damage if not cleared.
  - Always extinguish fire blocks with `clearFireAhead()` before advancing.
- **Exact Portal Geometry**:
  - `(298, 73..75, -54)`: Obsidian frame left column.
  - `(299, 73..75, -54)`: Active `nether_portal` blocks. Center: `(299.5, 73.0, -53.5)`.
  - `(300, 73..75, -54)`: Active `nether_portal` blocks. Center: `(300.5, 73.0, -53.5)`.
  - `(301, 73..75, -54)`: Obsidian frame right column.
  - Center is `(299.5, 73.0, -53.5)`.
- **Fortress Workshop Bunker (44, 65, -127)**:
  - Enclosed 100% blast-proof bunker. 2-high anti-wither-skeleton entrance.
  - Adjacent to covered tunnel (44, 65, -145) with neutral Piglins.
  - 20 nether_gold_ore blocks directly above at (32..34, 73..74, -135) and (37..39, 75..76, -114).

## Current Inventory & Gear
- Gamma en route to Fortress Workshop Bunker.
- Health: 20/20, Food: 20/20.
- Weapons: `iron_sword 100%`, `iron_pickaxe 99%`, `stone_sword 62%`, `stone_pickaxe 34%`, `bow 24%`.
- Armor: `golden_boots` (equipped - 100% Piglin neutrality), `shield` (offhand).
- Inventory: `gold_ingot x1`, `gold_nugget x1`, `cobblestone x4`, `oak_planks x1`, `stick x3`, `arrow x3`.
- Spawn set at base bed `(294, 72, -55)`.

## Key Coordinates
- Overworld Base: `(292..296, 72..75, -58..-54)`
- Overworld Nether Portal: `(299, 73, -54)` [Center: `299.5, 73.0, -53.5`]
- Nether Portal Bunker: `(40, 65, -7)` to `(46, 66, 2)`
- Safe East Ridge Trail: `x=61..63, y=64..67, z=-5..-100`
- Fortress Workshop Bunker: `(44, 65, -127)`
- Covered Tunnel & Piglin Trading Post: `(44, 65, -145)`
- Spawner Pillbox & Deck: `(36.5, 66, -187)`
- **BLAZE SPAWNER**: `(32, 68, -190)` [CONFIRMED at y=68]
