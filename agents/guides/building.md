# Building guide

## 1. Choose the site

- Near spawn, on open, fairly flat ground, away from pits, cave openings,
  water and lava. Check it in one program: heights over the footprint and
  what is there.

```js
// survey a 9x9 area with its corner at (x, z): the ground height of each column
const [x0, z0] = [40, -25]
const rows = []
for (let z = z0; z < z0 + 9; z++) {
  let row = ''
  for (let x = x0; x < x0 + 9; x++) {
    let y = 90
    while (y > 40 && lib.blockAt(x, y, z).boundingBox !== 'block') y--
    row += String(y).padStart(4)
  }
  rows.push(`z=${z}:${row}`)
}
console.log(rows.join('\n'))
```

- Pick the floor height `y` as the most common ground height + 1, then make
  it flat: `await lib.flatten(x1, z1, x2, z2, y)` (clears 4 blocks above,
  fills holes below with dirt; carry 20+ dirt).

## 2. Make a blueprint

A blueprint is just a list of `{x, y, z, name}`. Build it from shapes:

```js
const site = { x: 40, y: 77, z: -25 }        // floor-level corner
const house = lib.shapes.house({ ...site, width: 5, depth: 5, height: 3,
  wall: 'cobblestone', roof: 'oak_planks', door: 'south', windows: true })
const extra = lib.shapes.box('oak_planks', 40, 76, -25, 44, 76, -21)  // a wooden floor
const blueprint = [...house, ...extra]
globalThis.blueprint = blueprint            // keep it for later programs
console.log(JSON.stringify(lib.materials(blueprint)))
```

- Use `width` and `depth` of at least 5: the inside is 2 smaller (a width-3
  house has a single block of floor inside).
- **Don't make the roof of dirt**: dirt in sunlight turns into `grass_block`
  and `lib.materials` will report it missing. Use planks, cobblestone or slabs.
- `lib.shapes.house`: walls from `y` to `y+height-1`; the door gap is 2 high in
  the middle of the chosen wall; window gaps at `y+1` every other block (not in
  corners); a flat roof at `y+height`, one block wider on each side.
- Save the blueprint and its corner in `../team/notes.md` so both players
  build the same thing. Write blueprint code into `../team/autoload.js` so it
  survives restarts.

## 3. Gather, then build

1. `lib.materials(blueprint).missing` tells exactly what to gather.
2. Build in programs of ~60–150 blocks with `--timeout 300`:
   `const r = await lib.build(blueprint); console.log(JSON.stringify(r))`.
   It skips what is already placed, so just run it again after gathering more.
3. Read `r.failed`. Typical fixes: `occupied by ...` → `{replace: true}` or
   `lib.dig`; `none left in inventory` → gather; `nothing solid` → build the
   layer below first.
4. Verify by scanning: `lib.materials(blueprint).need` should become `{}`.

## 4. Details

- **Door**: craft `oak_door` (6 planks → 3 doors). Place its lower half in
  the doorway on the floor: `lib.place('oak_door', x, y, z)`. The pathfinder
  cannot walk through doors: enter and leave with `await
  lib.goThroughDoor(x, y, z)` (opens, steps through, closes behind you).
- A closed house with a door kept monsters out in our tests: a skeleton stood
  5 blocks away all night and did no damage.
- **Windows**: glass needs sand smelted in a furnace (`lib.smelt('sand',
  'oak_planks', 6)`) — or use `oak_fence`. Open window gaps let skeleton
  arrows in: fill them (glass, fence, or any block) before the first night, or
  build with `windows: false` and add windows later.
- **Light**: monsters spawn in dark rooms. Put 1–2 `torch` on the floor inside
  (coal + stick) and a few around the house.
- **Roof**: the flat roof is fine. Stairs (`oak_stairs`) make a pitched roof but
  need careful facing; only try it when the house is done.
- **Furniture**: `crafting_table`, `furnace`, `chest`, `white_bed` inside along
  the walls, not in the doorway.
- Do not place a block where you or your teammate stands (the server
  refuses). `lib.place` moves you out of the way, but it cannot move your
  teammate.

## 5. Building as a team

- Split by **part**, not by block: one player does the floor and walls of the
  north and west sides, the other south and east; or one gathers while the
  other builds.
- Claim your part in chat with coordinates before starting, and post progress
  with numbers ("west wall 12/15 placed").
- Bring materials to a shared chest next to the site
  (`lib.deposit({cobblestone: 'all'}, x, y, z)`) so whoever builds can take them.
- When done, both players scan the blueprint and agree it is complete before
  announcing it.
