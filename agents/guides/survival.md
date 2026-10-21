# Survival guide

Every death costs you your whole inventory and several minutes. In our first
test run the two players died 8 times in one night, all to monsters. Almost all
of it is avoidable with the rules below.

## The clock

One Minecraft day is 20 real minutes (24000 ticks). Every program's output
shows `TIME: <ticks> <phase> | night in Ns`.

| timeOfDay | What happens |
|---|---|
| 0 – 12000 | day: safe on the surface in light |
| 12000 | sunset |
| 12542 | you can sleep in a bed from now |
| **13188** | **hostile mobs start spawning on the surface** |
| 18000 | midnight |
| 22812 | last surface spawns |
| 23460 | zombies and skeletons start burning in sunlight; morning |

Hostile mobs also spawn at any time **in the dark**: caves, under dense trees,
inside unlit buildings (light level 0).

## Night protocol (do this every evening)

1. When `night in` drops below **90 s**, stop what you are doing.
2. Be inside a closed house (walls, roof, door closed or a block in the
   doorway) **or** in an emergency shelter: `await lib.shelter()` (needs 1–5
   dirt/cobblestone/planks; always carry 16 dirt or cobblestone).
3. If a bed is nearby and both players can reach one, sleep: `await
   lib.sleepInBed()` from 12542. The night is skipped only when **every**
   player is in bed; tell your teammate in chat.
4. While sheltered, do safe work: crafting, planning the build, writing notes
   and helpers. Check `lib.time()` every few minutes.
5. Leave after `timeOfDay` passes **23460** (or after 0): `await
   lib.leaveShelter()`. Look at `HOSTILES` first; creepers don't burn.

Never walk around, chop trees or build outdoors at night with wooden tools and
no armor. In our tests a player standing still in the open at spawn was shot
dead by skeletons three times in one night even though reflexes were on:
skeletons shoot from 15 blocks, out of reach.

## Monsters on Easy

| Mob | Threat | What to do |
|---|---|---|
| Zombie | melee, ~2.5 dmg; groups | fight with a sword (`lib.fight`), burns at dawn |
| Skeleton | arrows from 15 blocks | close the distance fast or break line of sight; don't stand in the open; burns at dawn |
| Spider | jumps, climbs walls | fight; neutral in daylight |
| Creeper | explodes (~up to 22 dmg at point blank), destroys blocks | **walk away** when one is within 6 blocks; never let it reach you; hit it once and step back only if you must. Reflexes never hit creepers. |
| Enderman | 4.5 dmg, 40 HP, teleports | **neutral unless you look at its head.** Don't look at endermen: never `bot.lookAt` an enderman, and keep your view low when one is near. If one is hostile, go under a 2-block-high ceiling (it is 2.9 tall and can't follow) or stand in water. |
| Witch, slime, phantom | rare early | avoid; phantoms appear only if you skip sleeping for 3+ nights |

`lib.reflexes` is on: your bot automatically swings at hostile mobs (except
creepers) within 3.5 blocks, even during other programs.

## Health and food

- Health 20, food 20. Health regenerates only while food ≥ 18.
- Auto-eat eats when food ≤ 14 if you carry food. **Always carry food.**
- Early food: kill cows, pigs, sheep (`lib.fight` won't do it: they are not
  hostile; walk next to them and `bot.attack(entity)` repeatedly), pick apples
  from oak leaves, bread from 3 wheat. Cook meat in a furnace
  (`lib.smelt('beef', 'oak_planks', 4)`) — cooked meat restores much more.
- At health ≤ 8: stop fighting, retreat, shelter, eat.
- Fall damage: falls over 3 blocks hurt. Don't jump into holes; `allowParkour`
  is off in `lib` movements for this reason.

## Terrain dangers

- **Never dig straight down** under your own feet, except with `lib.shelter`,
  which checks the ground first. You may fall into a cave or lava.
- Pits and caves are dark: monsters spawn there even in daytime. Our first
  run's player died three times in the same pit. Write dangerous places in the
  shared notes and avoid them.
- Lava destroys your items. Water: you can drown in ~15 s underwater;
  pathfinding through deep water is slow.
- Gravel and sand fall when the block under them is removed.

## After a death

- You respawn at the world spawn (or your bed) with an empty inventory.
  The items stay where you died for **5 minutes**, then vanish.
- The death message tells you how you died and the program output shows
  `died at (x, y, z)`. If it is safe (daytime, no mob nearby), go there at once:
  `await lib.goTo(x, y, z, 2); await lib.pickup(10)`. If not safe, ask your
  teammate in chat to pick them up and give exact coordinates and the deadline.
- Then write in `memory/notes.md` what killed you and the rule that would have
  prevented it.

## Gear priorities

1. Stone sword and stone pickaxe/axe as early as possible (3 cobblestone each).
2. 16+ dirt or cobblestone in the inventory at all times (shelters, towers,
   blocking doorways).
3. Food: at least 5 pieces.
4. A bed (3 wool of one color + 3 planks): sets your respawn point near the base
   and lets you skip the night. Wool comes from sheep (kill or shear).
5. Torches (coal or charcoal + stick) around and inside the base stop monsters
   spawning there.
6. Iron armor later (iron ore → `lib.smelt('raw_iron', 'coal', n)`).
