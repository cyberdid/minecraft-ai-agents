# alpha notes

## Now
- Status: Day 10 day (tick 7730, night in 273s). In base at (294.5, 72.0, -56.5). Health: 20/20, Food: 20/20.
- Wearing: iron_helmet, iron_leggings, iron_boots.
- Prepared base chest at (293, 72, -57) with stone pickaxes, stone sword, stone axe, iron leggings, and 116 cobblestone for Beta to re-arm.
- Left base door open at (294, 72, -54) for Beta's arrival.
- Nether portal site at (298, 72, -54) has flat foundation and 4 cobblestone ready.
- Next steps:
  1. Beta arrives at base, takes tools and iron leggings from base chest.
  2. Sleep through night 10 together in base.
  3. At Day 11 dawn, head to safe east hill (340, 75, -30) to mine 7+ iron ore, smelt in base furnace, and craft `iron_chestplate` -> Milestone 3 COMPLETE!
  4. Descend to y=-54 to mine 3 diamonds for diamond pickaxe, make and mine 10 obsidian, and light the Nether portal -> Milestone 7 COMPLETE!

## Lessons & Incidents
- **Skeleton Death at (337, 70, -32)**: Iron ore at y=52 was deep underground, causing the pathfinder to wander under dark trees trying to reach it. Lesson: Always filter ore searches to within 3 blocks of current Y (`Math.abs(b.y - bot.y) <= 3`) so the bot doesn't chase underground ore from the surface!
- **Doorway Obstruction & Leveling**: Doorways need level ground (cobblestone at y=71) on both sides for `lib.goThroughDoor` to pass smoothly.
- **Chest Placement**: Chests require a solid block directly beneath them at y-1; paved floor at y=71 before placing chest at (293, 72, -57).

## Milestones Tracker
- [x] Milestone 1: Base near spawn (Day 2 tick 4079)
- [x] Milestone 2: Iron tools for both players (Day 4 tick 9699)
- [In progress - 95%] Milestone 3: Full iron armor and shield for both players (Beta 100%, Alpha crafting chestplate)
- [x] Milestone 4: Bed for each player, spawn set (Day 2 tick 10739)
- [x] Milestone 5: 16+ cooked food each, bucket of water each
- [x] Milestone 6: Diamond pickaxe (Beta mined diamonds and crafted diamond_pickaxe!)
- [In progress] Milestone 7: Lit Nether portal (Beta mining 10 obsidian at y=-55)
