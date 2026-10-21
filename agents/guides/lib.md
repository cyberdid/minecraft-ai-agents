# `lib` — the skill library

Every program has a global `lib` with tested skills. Prefer them to raw
Mineflayer calls: each one checks its inputs, verifies its result against the
world, stops when your program times out, and throws an `Error` whose message
says what to do next. Read the message and act on it.

Also global in every program: `bot`, `console`, `isCancelled()`, `Vec3`,
`mcData` (minecraft-data for 1.20.1), `goals` and `Movements` (pathfinder),
`sleep(ms)`.

Source code: `../../bridge/lib/skills.js` (read it when a skill does something
you don't expect).

Names are exact Minecraft ids: `oak_log`, `oak_planks`, `cobblestone`,
`stone_pickaxe`, `white_bed`, `oak_door`. Where a skill takes a block name you
may use a pattern: `'*_log'` (any log), `'*_planks'`, or a list
`['oak_log', 'birch_log']`.

## The most useful call: lib.obtain

`await lib.obtain('iron_pickaxe', 1)` makes sure you **have** at least 1,
doing every prerequisite itself: wood → planks → table → wooden pickaxe →
stone → stone pickaxe → iron ore (digging down if needed) → furnace → fuel →
smelt → craft. It knows recipes, smelting, which block drops what, which tool
mines it, which animal drops it, flint from gravel, obsidian from lava + water.
Returns `{have, steps}`; on failure the error lists the steps so far. If you
die on the way it stops at once and says where your items are (5 minutes). Tested
from an empty inventory: iron pickaxe 96 s, bucket 99 s, full iron armor
~6 min, 3 diamonds 45 s after descending, diamond pickaxe, flint and steel.
See iron-age.md. Use long timeouts (300–900 s).

## Looking around

| Call | Returns |
|---|---|
| `lib.status()` | `{pos, dimension, health, food, timeOfDay, phase, night, secondsUntilNight, inventory, hostiles}` |
| `lib.time()` | `{timeOfDay, phase, night, canSleep, secondsUntilNight}` |
| `lib.inv()` | `{oak_log: 6, stick: 12, ...}` |
| `lib.count('oak_planks')` / `lib.count('*_planks')` | a number |
| `lib.hostiles(16)` | `[{name, pos, dist}]`, nearest first |
| `lib.find('*_log', {maxDistance: 64, count: 5})` | blocks, nearest first (`b.name`, `b.position`) |
| `lib.blockAt(x, y, z)` | the block (`.name`) |
| `lib.recipe('furnace')` | text: what one craft needs and makes |
| `lib.tools()` | durability left of your tools and weapons, e.g. `{iron_pickaxe: '34%'}` (also in every status line as `GEAR:`) |
| `lib.fmt(pos)` | `"(x, y, z)"` |

## Moving

| Call | Notes |
|---|---|
| `await lib.goTo(x, y, z, range = 1)` | walks and towers up with dirt/cobblestone; 60 s limit; throws if no path. **Does not dig** (digging while walking wrecked house walls and pulled doors off their floor). Pass `{dig: true}` as 5th argument to allow digging through terrain: `lib.goTo(x, y, z, 1, {dig: true})`. |
| `await lib.goToXZ(x, z)` | long trips where height doesn't matter |
| `await lib.goNearBlock(x, y, z)` | stand where you can reach that block |
| `await lib.goThroughDoor(x, y, z)` | the pathfinder can't pass doors. This walks to the door, opens it, steps through to the other side and closes it. Use it to enter and leave buildings. |
| `await lib.door(x, y, z, true/false)` | open / close a door |
| `await lib.walkTo(x, z)` | walk straight with the movement keys (short distances, no obstacles) |
| `await lib.explore(dx, dz, seconds, check)` | walk in direction (dx, dz ∈ -1/0/1) until `check()` returns something; returns it or `null`. Example: `await lib.explore(1, 0, 40, () => lib.find('*_log')[0])` |

## Gathering

| Call | Notes |
|---|---|
| `await lib.collect('*_log', 6)` | mines 6 matching blocks (nearest first, up to 64 blocks away; if there are none it walks once to the nearest one within 128), equips the best tool, picks up drops. Returns what was gained: `{oak_log: 6, oak_sapling: 1}`. Skips blocks it can't reach. Throws if it mined nothing. |
| `await lib.dig(x, y, z)` | one block, best tool, verified |
| `await lib.pickup(8)` | walk over item drops within 8 blocks; returns how many items were gained |
| `await lib.descend(y)` | staircase down to height y (diamonds: −54), one step forward and one down; turns away from lava/water, fills holes, torch every 8 steps. Walk back up the stairs. |
| `await lib.hunt('cow', 3)` | kill 3 cows (or any mob by name) and pick up the drops; explores up to 40 s to find them. Animals live on grass, not in deserts. |
| `await lib.fillBucket('water')` | fill an empty bucket from water with an open surface (lakes, rivers); `'lava'` works too |
| `await lib.makeObsidian(10)` | pour water onto a lava pool edge, take the water back, mine the obsidian (needs diamond_pickaxe + bucket; tested: 3×3 pool → 9 obsidian in 65 s) |
| `await lib.clearArea(x1, y1, z1, x2, y2, z2)` | dig every block in the box, top layer first |
| `await lib.flatten(x1, z1, x2, z2, y)` | make a flat floor at height `y` (floor blocks at `y-1`): clears 4 blocks above, fills holes with dirt |

Typical costs: a log takes ~3 s by hand; 6 logs from a nearby tree ~60 s
including walking; 14 stone with a wooden pickaxe ~30 s.

## Crafting and smelting

| Call | Notes |
|---|---|
| `await lib.craft('oak_planks', 16)` | crafts until you have **16 more** (not "16 crafts"). Finds or places a crafting table when the recipe needs one (crafts the table from your planks or logs if you have none). Retries the known Mineflayer crafting glitch. Throws with the recipe and your inventory when ingredients are missing. |
| `await lib.ensureTable()` | the nearest crafting table, placing one if needed |
| `await lib.stowCursor()` / `await lib.clearCraftingGrid()` | recover items stuck on the mouse cursor or in the crafting grid after a raw `bot.craft` failed (`lib.craft` does this itself) |
| `await lib.smelt('raw_iron', 'coal', 8)` | uses the nearest furnace, or places one from your inventory; waits ~10 s per item; returns `{smelted}` |
| `lib.recipe(name)` | check before crafting something new |

## Placing and building

| Call | Notes |
|---|---|
| `await lib.place('oak_planks', x, y, z)` | needs a solid neighbour to place against (build bottom-up). Moves into reach, never into the target. Returns `'placed'` or `'already there'`. |
| `lib.shapes.box(name, x1, y1, z1, x2, y2, z2)` | list of blocks filling a box (walls, floors, pillars) |
| `lib.shapes.house({x, y, z, width: 5, depth: 5, height: 3, wall: 'oak_planks', floor: null, roof: null, door: 'south', windows: true})` | hollow house: (x, y, z) is the floor-level corner, walls go up from y, a 2-high door gap in the `door` wall, window gaps at y+1, a flat roof one block wider than the walls |
| `lib.shapes.portal(x, y, z, 'x')` | the Nether portal frame: 10 obsidian + 4 cobblestone corners (bottom-left corner at x,y,z, along +x or +z); then `await lib.ignite(x + 1, y, z)` lights it with flint and steel |
| `await lib.freeSpot()` | an empty spot on solid ground near you (for a chest, furnace, table); in a tight tunnel it digs a niche in the wall |
| `lib.materials(blocks)` | `{need, missing}`: blocks still to place and what you lack. Gather the `missing` before building. |
| `await lib.build(blocks, {replace: false})` | places a list `[{x, y, z, name}]` bottom-up, nearest first, retrying blocks that had no support yet. With `replace: true` it digs out terrain in the way. Returns `{placed, dug, skipped, failed: [...]}`; check `failed`. |

Doors, torches, beds: `lib.place('oak_door', x, y, z)` with (x, y, z) the lower
half, on a solid floor, in a 2-high gap. Torches go on the floor or a wall.

**Your buildings are protected.** Every block placed with `lib.place` /
`lib.build` (and the block under a door, bed or torch) is remembered, shared by
both players: the pathfinder never breaks it and `lib.collect` never mines it.
`lib.dig(x, y, z)` still removes it when you ask explicitly. Doors, beds,
chests, crafting tables, furnaces, glass and torches are never broken by
walking either. `lib.protect(x, y, z, false)` lifts protection.

## Containers and Smelting

| Call | Notes |
|---|---|
| `await lib.deposit('all', x, y, z)` | put everything except tools, weapons, armor and the crafting table into the chest at x,y,z (or the nearest chest if coordinates omitted) |
| `await lib.deposit({cobblestone: 32, dirt: 'all'}, x, y, z)` | specific items (omit x,y,z to use nearest chest) |
| `await lib.withdraw({oak_planks: 20}, x, y, z)` | take items (omit x,y,z to use nearest chest) |
| `await lib.chestContents(x, y, z)` | `{name: count}` (omit x,y,z to inspect nearest chest on base) |
| `await lib.smelt(input, fuel, n)` | smelts in the nearest furnace. **Tip**: craft and place 2–3 furnaces side-by-side on the base to parallelize smelting 3× faster! |

## Staying alive

| Call | Notes |
|---|---|
| `await lib.shelter()` | emergency: digs 2 down where you stand and seals the sides and the top. Needs 1–5 dirt/cobblestone/planks. Refuses on sand, gravel or above a cave. Use it when night falls away from a house. |
| `await lib.leaveShelter()` | digs up and climbs out |
| `await lib.fight(10, 30)` | equips your best sword/axe and fights hostile mobs within 10 blocks for up to 30 s. Ignores endermen farther than 4 blocks. Throws "retreated" if health drops to 6 or below: then shelter and eat. **Tested: a stone sword lost to one skeleton at night (20 → 4 health). Fight zombies and spiders; avoid skeletons and creepers; don't fight at night at all if you can hide.** |
| `await lib.eat()` | eats your best food (also raw meat, which auto-eat skips so it can be cooked) |
| `await lib.equipArmor()` | wears the best helmet, chestplate, leggings, boots you carry and a shield in the off hand |
| `await lib.setSpawn()` | respawn at the nearest bed (by day it right-clicks the bed; at night it sleeps) |
| `await lib.placeTorch()` | torch on the floor next to you |
| `await lib.equipWeapon()` | best sword or axe in hand |
| `await lib.sleepInBed()` | finds a bed within 32 blocks and sleeps (night only) |
| `lib.reflexes(true/false)` | **on by default**: your bot hits any hostile mob (not creepers) that comes within 3.5 blocks, even while another program runs |

Automatic, always on: **auto-eat** (eats when food ≤ 14; never rotten flesh or
raw meat), **auto-armor** (wears the best armor you pick up), **swim up** when
out of air (a test bot drowned standing in water), and **parking**: after 5
minutes without programs your player logs out where it stands so monsters
can't kill it; the next `./mc run` logs it back in (`STATUS: parked`).

## Your own helpers

Define helpers on `globalThis` and they stay for later programs. They are lost
when the bridge restarts, so also keep them in `autoload.js` in your folder:
the bridge runs `../team/autoload.js` and then your `autoload.js` once each time
it starts. Shared helpers go in `../team/autoload.js` (tell your teammate).
