# Writing programs that work

## Shape of a good program

```js
// programs/014-wood-for-walls.js — one clear goal, verified at the end
const before = lib.count('*_log')
const got = await lib.collect('*_log', 10)
console.log('gained', JSON.stringify(got))
await lib.craft('oak_planks', 32)
console.log('planks now', lib.count('oak_planks'), '| time', lib.time().phase)
```

- **One goal per program**, 20 s – 3 min of game actions. Long programs that
  fail halfway waste the whole run; tiny ones waste your thinking time.
- **Print what you need to decide the next step**: counts, positions, the
  `report` of `lib.build`. Don't print huge lists.
- **Verify at the end** against the world: `lib.count(...)`,
  `lib.blockAt(x, y, z).name`. The output of a program is the only truth;
  never announce success in chat before the output shows it.
- **Pick the timeout from the work**: `--timeout 60` for a few actions,
  `120–300` for gathering or building. Too short a timeout cuts a program off
  in the middle (our first run lost several tree-chopping programs this way).
- Read-only checks are cheap and instant: `return lib.status()`.

## Long work and timeouts

When a program times out, the bridge cancels it: `isCancelled()` becomes true,
movement and digging stop, and every `lib` skill throws `cancelled`. Your own
loops must check it:

```js
while (!isCancelled() && lib.count('cobblestone') < 64) {
  await lib.collect('stone', 8)
}
```

Output printed by a cancelled program after the timeout shows up in your next
program's output under "output from earlier programs still running".

## Errors you will meet, and what they mean

| Error | Cause | Fix |
|---|---|---|
| `Vec3 is not defined` | old habit | `Vec3`, `mcData`, `goals`, `Movements` are globals now |
| `Event updateSlot:0 did not fire` | Mineflayer crafting glitch on 1.20 | use `lib.craft` (handles it). If you used `bot.craft`, run `await lib.clearCraftingGrid()` and check the inventory. |
| `no block named 'x'` / `no item named 'x'` | wrong id | exact ids: `oak_log` not `log`, `cobblestone` not `stone` for the item you get from stone |
| `nothing solid next to (x, y, z)` | placing into the air | build bottom-up, or place a support first |
| `(x, y, z) is occupied by grass_block` | terrain in the way | `lib.build(blocks, {replace: true})` or `lib.flatten` the site first |
| `movement failed: ... No path` | unreachable target | pick another target, or `lib.goToXZ` closer first |
| `mined nothing for "*_log" within 64 blocks` | nothing nearby | `lib.explore(dx, dz, 40, () => lib.find('*_log')[0])` |
| `bot is not in the world` | you are dead or reconnecting | wait 5 s, check `./mc status` |
| `program #N is still running` | you started a second program | wait for the first one |
| `retreated from <mob>: health N` | losing a fight | shelter now, eat, fight only by day |

## The inventory can lag

Mineflayer's view of your inventory can be off by a few items for a moment
after crafting or picking up. Before a big plan (a build, a long craft chain)
re-read `lib.inv()` in a fresh program. If something looks impossible, check
again rather than retrying blindly.

## Raw Mineflayer when you need it

`bot` is a normal Mineflayer bot; the docs are in
`../../bridge/node_modules/mineflayer/docs/api.md` and pathfinder in
`../../bridge/node_modules/mineflayer-pathfinder/readme.md`. Useful bits:

```js
bot.entity.position                 // Vec3 of your feet
bot.blockAt(new Vec3(x, y, z))      // block .name, .position, .boundingBox ('block' = solid)
bot.findBlocks({ matching: b => b.name === 'iron_ore', maxDistance: 32, count: 10 })
bot.nearestEntity(e => e.name === 'cow')
await bot.pathfinder.goto(new goals.GoalNear(x, y, z, 1))
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand')
bot.attack(entity)                  // one hit; repeat every ~600 ms
await bot.activateBlock(block)      // right-click: open doors, press buttons
bot.chat('message')                 // everyone sees it
bot.players                         // other players; bot.players.beta.entity?.position
```

- Don't register `bot.on(...)` listeners in normal programs: they pile up
  across programs. If you need one, keep its handle on `globalThis` and remove
  it with `bot.removeListener`.
- `bot.lookAt` an enderman's head makes it hostile.

## Keep and reuse your tools

- Put helpers you write on `globalThis` (they persist between programs) **and**
  in `autoload.js` in your folder so they come back after a bridge restart.
- Note in `memory/notes.md` what each helper does and when it failed.
- If a `lib` skill is wrong or missing something, write a better helper and
  tell your teammate; don't fight the same bug twice.
