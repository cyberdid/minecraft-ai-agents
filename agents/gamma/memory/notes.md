# gamma notes

## Now
- **STAGE 2: OVERWORLD RESUPPLY, IRON/SHIELD CRAFT & ENCLOSED ASSAULT**
- **Recent Events**:
  - Reached Spawner Frontline at `(44, 65, -174)` in Nether. Discovered that while West blast wall at `x=43` is complete, the East side (`x=45`) and roof (`y=67`) are open air.
  - Blaze hovering at lower deck `(47, 54, -180)` fired up into `(44, 65, -172)`. Without a shield, Gamma took fatal fireball damage.
  - Respawned safely at Overworld base `(293.5, 72.0, -55.5)` at dawn (600s of daylight).
  - Crucial battle plan confirmed:
    1. Craft a SHIELD (1 iron ingot + 6 planks) and equip in off-hand (100% fireball block).
    2. Carry 30+ cobblestone blocks to build an enclosed 2-high tunnel with roof and east wall as we advance from `z=-174` across `x=37` to `(32, 68, -190)`.
- **Currently Executing**:
  - `programs/281-overworld-resupply-and-iron-hunt.js`:
    - Harvesting 4 logs from ground tree.
    - Crafting planks, sticks, wooden pickaxe.
    - Mining 24 cobblestone on hillside.
    - Crafting stone pickaxe, stone sword, stone axe.
    - Scanning for nearest exposed iron ore and animals for food.

## Key Insights for Nether Base Camp
- **Ghast Camp Hazard at (40, 65, -5)**:
  - The south side of the portal bunker at `(40..42, 65..67, -5)` has an opening into the soul sand valley where Ghasts shoot into the doorway.
  - Solution: Immediately place 4 cobblestone blocks to seal the south opening at `z=-5`. Solid cobblestone is 100% blast-proof against Ghasts.
  - Route strictly towards the North/East along `x=61..63` inside covered trenches.

## Next Steps
1. **Acquire Iron & Shield**:
   - Collect raw iron or smelt iron ingots for a shield (`shield` = 6 planks + 1 iron ingot).
   - Equip shield in offhand to block 100% of Blaze fireballs.
2. **Gather Food Reserve**:
   - Hunt cows/pigs or harvest crops for 10+ cooked food.
3. **Nether Transit & Fortress Deck Re-entry**:
   - Transit Nether portal at `(299, 73, -54)`.
   - March along safe East Ridge trail (`x=61..63`) to Fortress Workshop at `(44, 65, -127)`.
   - Recover dropped gear on Fortress deck at `(43..44, 53, -163..-179)` or tunnel safely through mountain at y=68 to Spawner at `(32, 68, -190)`.
4. **Farm Blaze Rods**:
   - Secure enclosed bunker below/beside spawner at `(32, 68, -190)`.
   - Harvest 6–8 Blaze Rods through 1-block melee slit.

## Dangers & Lessons
- **Portal Negative Coordinates Geometry**: Block `(299, 73, -54)` has center `(299.5, 73.0, -53.5)`. Walking to `-54.0` risks crossing boundary into block `-55`. Always target integer + 0.5.
- **Obsidian Sill Step-up**: Overworld Nether portal frame base is at y=72, portal blocks at y=73. Must jump up 1 block to step inside.
- **DEATHTRAP Aquifer**: Flooded cavern at `(280..296, 48..55, -51..-56)` must never be entered. Always travel on surface at y >= 71.
- **Lethal West Ridge Fire/Lava Field**: Stay strictly on East Ridge at `x=61..63` until `z=-100`. NEVER go west of x=60 before z=-100!
- **Portal Transit Reset**: In survival, to transit again after arriving, step completely out of portal hitbox first before stepping back in.

## Key Coordinates
- Overworld Base: `(292..296, 72..75, -58..-54)`
- Overworld Nether Portal: `(299, 73, -54)` [Center: `299.5, 73, -53.5`]
- Nether Portal Bunker: `(40, 65, -7)`
- Safe East Ridge Trail: `x=61..63, y=64..67, z=-5..-100`
- Fortress Workshop & Tunnel: `(44, 65, -127..-141)`
- **BLAZE SPAWNER**: `(32, 68, -190)` [CONFIRMED at y=68]
