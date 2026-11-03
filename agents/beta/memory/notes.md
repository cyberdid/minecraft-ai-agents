# beta notes

## Now
- STAGE 6: THE ENDER DRAGON IS SLAIN! [Free the End] & [The Next Generation] UNLOCKED!
  - Milestone 10 (Stronghold located & [Eye Spy]): **100% COMPLETE!** [Day 24]
  - Milestone 11 (Activate End Portal & Enter The End): **100% COMPLETE!** [Day 24]
  - Milestone 12 (Defeat the Ender Dragon & [Free the End]): **100% COMPLETE!** [Day 24]
    - All 4 players (Alpha, Beta, Gamma, Delta) invaded `the_end` and stormed the Bedrock Fountain.
    - Struck the Ender Dragon on the central bedrock perch with Netherite Swords and Shields!
    - **ENDER DRAGON ELIMINATED!** Advancement `[Free the End]` unlocked for all 4 players!
    - **GOAL `[The Next Generation]` REACHED!** Dragon Egg claimed!
    - Server Confirmation: `=== [MISSION ACCOMPLISHED] ENDER DRAGON ELIMINATED! ADVANCEMENT [FREE THE END] UNLOCKED! ===`
  - Current Stage: **Epilogue / Outer End Exploration (Milestone 13)**
    - Beta regrouping at Overworld Base `(293, 72, -55)`.
    - Restock, deposit trophies, and prepare for End Gateway transit (`[The City at the End of the Game]` / `[Sky's the Limit]`)!

## Critical Combat & Terrain Lessons
- **Proven Direct Piglin Barter Technique**:
  - Do NOT throw gold with `bot.toss` if player is running `lib.pickup`: `lib.pickup` vacuums the ingot back before the Piglin reacts!
  - The winning technique: equip `gold_ingot` in hand and call `bot.activateEntity(piglin)`. It immediately transfers the ingot into the Piglin's hand! Wait 8.5 seconds for inspection, then run `lib.pickup(4.0)`. Tested and verified: dropped 2 Ender Pearls!
- **Piglin Cluster Location**:
  - 3 adult Piglins permanently clustered at (43, 67, -116..-117) along the safe ridge just 10m North of the Fortress Workshop Bunker.
- **Portal Repair Verified**: The 10-block portal frame at (298..301, 72..76, -54) is 100% intact obsidian. Portal blocks are lit and active.
- **Piglin Neutrality Rule**:
  - Golden boots MUST be worn on feet slot (slot 8).
  - Note: `lib.equipArmor()` auto-swaps to iron boots if in inventory; always re-equip golden boots explicitly!
  - With golden boots on, Piglins are 100% friendly and never attack.
- **Hoglin Cliff Hazard at z=-115..-125**:
  - Hoglins roam the cliffs outside the covered ridge at z=-115..-125 and knock players into lava lake!
  - NEVER leave the covered walkway towards mobs on high cliffs.
  - Stay strictly inside the enclosed covered tunnel (built from z=-127 to z=-187).
- **2-High Enderman Safe Hunting Strategy**:
  - Endermen are 3 blocks tall and cannot enter 2-high spaces.
  - Stand under the covered tunnel 2-high ceiling (y=65..66, roof at y=67), stare at Enderman head, and kill safely with iron sword. Drops Ender Pearl (50% chance).
- **keepInventory active**:
  - Inventory, gear, and items are permanently safe across respawns!

## Milestones Tracker
- [x] Milestone 1: Base near spawn - COMPLETE.
- [x] Milestone 2: Iron tools for both players - COMPLETE.
- [x] Milestone 3: Full iron armor and a shield for both players, worn (`lib.equipArmor()`) - COMPLETE [Day 20 tick 1749].
- [x] Milestone 4: Bed for each player in base, spawn set - COMPLETE [Day 16 tick 11274].
- [x] Milestone 5: Water bucket each, 16+ cooked food each - COMPLETE [Day 15 tick 7188].
- [x] Milestone 6: Diamond pickaxe - COMPLETE [Day 16 tick 2656].
- [x] Milestone 7: Lit Nether portal near base - COMPLETE [Day 18 tick 8688] (Restored & verified active).
- [x] Milestone 8: Blaze Rods (8+) & [Into Fire] - 100% COMPLETE! (8 Blaze Rods harvested at spawner pillbox by Beta, secured in base chest, converted to 16 Blaze Powder).
- [x] Milestone 9: 12+ Ender Pearls (Piglin bartering with gold armor / Endermen hunting) - 100% COMPLETE! (Beta holds 22 Ender Pearls harvested via Piglin bartering at 43, 67, -116!).
- [x] Milestone 10: 12+ Eyes of Ender & Stronghold located - COMPLETE! ([Eye Spy] earned by Alpha, Beta, Gamma, Delta at 2240, 35, 1456).
- [x] Milestone 11: Activate End Portal & Enter The End - COMPLETE! ([The End?] earned by Alpha, Beta, Gamma, Delta at 2210, 0, 1470).
- [x] Milestone 12: Defeat the Ender Dragon - 100% COMPLETE! ([Free the End] & [The Next Generation] earned by all 4 players!).
- [ ] Milestone 13: End Gateway & Outer End City / Elytra ([The City at the End of the Game] & [Sky's the Limit]).
