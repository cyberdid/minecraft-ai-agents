# alpha notes

## Now
- Status: In Overworld base shelter at (295.5, 72.0, -52.7) at dawn. Health: 20/20, Food: 20/20. Executing Program 572 (task task-3029): withdrawing cobblestone and planks from base chest, crafting stone pickaxe & 2 stone swords, exiting base door, entering Nether portal at (299, 73, -54), and sprinting along strictly low-elevation trail (y=64..65, z=-7) to avoid surface soul fire, advancing directly across Delta's completed bridge to Spawner Balcony at (34, 67, -187) to slay Blazes and harvest Blaze Rods.
- Milestone 8 Breakthrough: Bridge connection to Spawner Balcony at (34, 67, -187) is 100% COMPLETE! Spawner is 7m away at (32, 68, -190); Alpha leading the frontline assault!
- Action: Withdraw materials, craft stone weapons, enter Nether, advance to (34, 67, -187), slay Blazes safely through protected firing barrier, and harvest 6–8 Blaze Rods.
- Next Step: Harvest 6–8 Blaze Rods for Eyes of Ender, claim Milestone 8 in notes, and proceed to Milestone 9 (Ender Pearls & Stronghold search)!

## Lessons & Incidents
- **Strict Floor Verification when Bridging Abyss (36, 65, -185)**: Never step forward onto a bridge coordinate without verifying `bot.blockAt(nextPos)?.boundingBox === 'block'`. Alpha fell to lava at y=30 when moving toward an air block. Always place floor against solid neighbor and verify block existence before taking a step.
- **Shield is Mandatory for Blaze Balcony Approach**: Approaching z < -170 without a raised shield in offhand results in Blaze fireball deaths. Holding a shield in offhand (`lib.equipArmor()`, slot 45) blocks 100% of fireball damage. Crafting shields for all players from surface iron at (350, 55, -35) is the proven path to victory.
- **19 Dropped Items on Fortress Deck (y=53, z=-174..-182)**: All previous dropped gear (stone swords, stone pickaxes, cobble) is sitting safely on the nether brick fortress corridor deck at y=53 directly under the tunnel end. Building a safe cobblestone staircase down connects the tunnel to the fortress deck and recovers all gear.
- **Delta's Enclosed Blast-Proof Corridor (44, 65, -163)**: Delta successfully bridged and enclosed the bridge gap at z=-163 with cobblestone walls and roof, completely preventing Blaze fireball line-of-sight! All players can safely advance through z=-163 under cover.
- **Enderman Gaze Hazard along Nether Ridge (63, 65, -39)**: Looking straight ahead at eye level (`y = 65.0`) aggroed an Enderman on the ridge at `z = -39` who knocked Alpha off the ridge into the valley. Prevention: ALWAYS pitch gaze down to feet level (`y = 64`) when traversing open Nether soul sand ridges to never trigger Enderman gaze mechanics!
- **Lethal Fire Pit Waypoint Constraint (55.5, 65.4, -74.3)**: Never jump directly from `(61, 67, -60)` to `(54, 65, -90)`: that path cuts right into the lethal fire pit at `(55.5, 65.4, -74.3)`. ALWAYS route through intermediate waypoints `(62, 67, -80)` and `(61, 66, -100)` before turning West to `(50, 65, -115)`! Gamma has now enclosed this section with solid walls.
- **Soul Sand Hill Breach (63, 65, -6..-22)**: The soul sand ridge between z=-6 and z=-22 was blocked by solid soul sand. Alpha and Gamma successfully excavated a 1x2 tunnel through it, creating an open, rapid transit corridor from portal camp to the ridge.
- **Overhang Drop at Mountain Entrance (44, 64, -149)**: The bridge floor stops at z=-148. At z=-149, the underside is open air dropping 11 blocks to y=53. Solid cobblestone floor placed at (44, 64, -149) by team.
- **Easy Difficulty Hunger Floor**: On Easy difficulty, starvation reduces health to a minimum of 10 HP (5 hearts) but will never kill the player. Full reset to 20/20 HP and 20/20 Food occurs instantly upon sleeping and waking at dawn.

## Milestones Tracker
- [x] Milestone 1: Base near spawn (Day 2 tick 4079)
- [x] Milestone 2: Iron tools for both players (Day 4 tick 11279)
- [x] Milestone 3: Full iron armor and shield for all players worn (`lib.equipArmor()`) (Day 20 tick 1749)
- [x] Milestone 4: Bed for each player, spawn set (Day 16 tick 11274 - Bed 1 & Bed 2 active)
- [x] Milestone 5: 16+ cooked food each, bucket of water each (Day 15 tick 7188)
- [x] Milestone 6: Diamond pickaxe (Day 16 tick 2656)
- [x] Milestone 7: Lit Nether portal near base (Day 18 tick 8688 - 6 active portal blocks at 298, 72, -54)
