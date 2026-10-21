# Iron Age guide: from wood to full iron gear and a Nether portal

Everything here was run on this server before you got it. Times are from
those test runs.

## lib.obtain does the tech tree for you

`await lib.obtain(item, n)` makes sure you have **at least n** of an item and
works out the whole chain from the game data: what to craft from what, what
to smelt, which block drops it and which tool can mine it, which animal drops
it. Every step is printed in `r.steps`.

```js
const r = await lib.obtain('iron_pickaxe', 1)   // from an empty inventory: 96 s in our test
console.log(r.steps.join('\n'))
// iron_pickaxe ×1: craft 1× from {"iron_ingot":3,"stick":2}
//   iron_ingot ×3: smelt raw_iron
//     raw_iron needs stone_pickaxe
//       stone_pickaxe ×1: craft 1× from {"cobblestone":3,"stick":2}
//         cobblestone needs wooden_pickaxe ...
```

Tested from scratch: `iron_pickaxe`, `iron_sword`, `shield`, `bucket`,
`torch`, `iron_helmet`, `iron_chestplate`, `iron_boots`, `iron_leggings`.

- Note the difference: `lib.craft(name, n)` makes **n more**;
  `lib.obtain(name, n)` makes sure you **have n**.
- When it fails, the error says why and shows the steps so far. Typical:
  `could not find iron_ore … explore farther` → walk somewhere else
  (mountains and caves have exposed ore), `no cow found` → go to grassland.
- It mines underground where needed (down to 48 blocks below you) and, for
  diamonds and other deep ores, digs a staircase down first (`lib.descend`).
- Give long timeouts: `--timeout 600` for a chain like an iron pickaxe from
  scratch, 900 for armor.
- Watch the time: a long `obtain` started at dusk keeps you outdoors at night.
  Underground is safer than the surface at night, but caves are dark too.

## Order of the Iron Age (both players, split the work)

1. Wood, crafting table, stone tools (see progression.md) — a few minutes.
2. `lib.obtain('iron_pickaxe')`, then `iron_sword`, `iron_axe`.
3. Armor: `iron_helmet` (5 ingots), `iron_chestplate` (8), `iron_leggings`
   (7), `iron_boots` (4) = 24 iron per player. Then `await lib.equipArmor()`.
   Armor cuts damage a lot: in our tests an unarmored player died to one
   skeleton; with iron armor the same fights were survivable.
4. `shield` (6 planks + 1 iron). `lib.equipArmor()` puts it in the off hand.
5. `bucket` (3 iron); `await lib.fillBucket('water')` near water. A water
   bucket saves you from lava and long falls and is needed for the portal
   (option B below).
6. Food: `lib.obtain('cooked_beef', 16)` (hunts cows, cooks the meat). Also
   `cooked_porkchop`, `cooked_mutton`. Keep 10+ cooked food each.
7. Beds: `lib.obtain('white_bed')` (3 wool from sheep + 3 planks), place it
   in the base, `await lib.setSpawn()`. Now you respawn at home, and you can
   skip nights (both players in bed).
8. Torches: `lib.obtain('torch', 32)` (coal + sticks); `await
   lib.placeTorch()` in the base and in mines.

Split, for example: one player does tools/armor for both (mining iron), the
other food, beds and the base; then swap gear through the chest.

## Mining safely

- Iron ore is common in hillsides and caves above y 64 and around y 16.
  `lib.find(['iron_ore', 'deepslate_iron_ore'], {count: 20})` shows what is
  in the loaded area.
- Never dig straight down. For deep ores use `await lib.descend(y)`: a
  staircase one step forward and one down, turning away from lava and water,
  filling holes, with a torch every 8 steps. Walk back up the stairs
  (`lib.goTo` the top).
- Diamonds: y −58 to 16, most common around **y −54**; need an iron pickaxe.
  `lib.obtain('diamond', 3)` descends and searches by itself (45 s in one
  test when diamonds were near). A staircase digs ~3 blocks per step: in
  another test a 110-step staircase wore out an iron, a stone and a wooden
  pickaxe. `obtain` now crafts 3 spare stone pickaxes first, and `descend`
  stops when you have no pickaxe left. Near lakes and the sea the staircase
  runs into water; `obtain` then walks ~28 blocks away and starts again.
- Underground water in rock can't be scooped (no open surface): fill buckets
  at lakes and rivers.
- Lava is the big killer underground: it destroys the items you drop.
  Carry a water bucket and cobblestone. If you see lava in the output
  (`lib.find('lava')`), don't walk towards it.
- **Tool durability**: the status line shows `GEAR: iron_pickaxe 34%`. In our
  test two pickaxes wore out during one long mining trip. Keep a spare
  (`lib.obtain('stone_pickaxe', 2)` is cheap), make a new iron one below 20%.
- Mines are dark: monsters spawn in caves even by day. Armor first, then deep
  mining.

## Toward the Nether portal

A portal is a frame of **obsidian**, 4 wide × 5 tall (10 obsidian without
corners, 14 with), lit with **flint and steel** (`lib.obtain('flint_and_steel')`
— iron + flint from gravel).

- Tested end to end on this server: diamonds, diamond pickaxe, flint and
  steel, `lib.makeObsidian` (a 3×3 lava pool → 9 obsidian, water taken back,
  65 s; the first pour sometimes misses, it retries), the frame with
  `lib.build(lib.shapes.portal(...))` (14 blocks placed, none failed) and
  `lib.ignite` → `lit: nether_portal`.
- **Option A — diamond pickaxe** (simplest): `lib.obtain('diamond_pickaxe')`
  (3 diamonds). Obsidian forms where water flowed onto still lava (lava lakes
  in caves around y −54 and on the surface). `lib.obtain('obsidian', 10)`
  mines it with the diamond pickaxe; each block takes ~10 s.
- **Option B — bucket casting**: pour water from a bucket onto lava source
  blocks to turn them into obsidian in place, then mine them (still needs a
  diamond pickaxe) — or build the frame with lava + water directly. This is
  advanced; only try it after reading about it carefully and testing in small
  steps.
- Build the frame on flat ground near the base:
  ```js
  const frame = lib.shapes.portal(x, y, z, 'x')   // (x,y,z) = bottom-left corner, frame along +x
  console.log(JSON.stringify(lib.materials(frame)))  // 10 obsidian + 4 cobblestone corners
  console.log(JSON.stringify(await lib.build(frame)))
  console.log(await lib.ignite(x + 1, y, z))      // light a bottom obsidian block from inside
  ```
  Success prints `lit: nether_portal`. The 4 corners can be any block (the
  side columns need them to be placed against); the bottom row needs solid
  ground under it and 5 free blocks of height.

Write each milestone in `team/notes.md` the moment you reach it.
