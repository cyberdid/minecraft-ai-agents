// Skill library available to every program as `lib` (see agents/guides/lib.md).
// Ideas and several patterns come from Voyager's control primitives
// (MineDojo/Voyager, MIT); everything here was re-tested on 1.20.4 and 1.20.1.
//
// Every skill:
//  - checks its inputs and throws an Error with a message that says what to do,
//  - verifies its result against the world or inventory instead of trusting
//    Mineflayer's promise,
//  - stops when the program that called it times out (ctl.cancelled()).

const { Vec3 } = require('vec3')
const { goals, Movements } = require('mineflayer-pathfinder')
const { attachObtain } = require('./obtain')

const HOSTILE = new Set([
  'zombie', 'zombie_villager', 'husk', 'drowned', 'skeleton', 'stray', 'spider', 'cave_spider',
  'creeper', 'witch', 'slime', 'phantom', 'enderman', 'silverfish', 'pillager', 'vindicator',
  'blaze', 'ghast', 'magma_cube', 'piglin_brute', 'hoglin', 'zoglin', 'wither_skeleton', 'guardian'
])
const FOOD_PRIORITY = [
  'cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_salmon', 'baked_potato', 'cooked_chicken',
  'cooked_rabbit', 'cooked_cod', 'bread', 'golden_carrot', 'carrot', 'apple', 'sweet_berries', 'melon_slice',
  'beef', 'porkchop', 'mutton', 'rabbit', 'chicken', 'cod', 'salmon', 'potato', 'beetroot'
]
const WEAPONS = ['netherite_sword', 'diamond_sword', 'iron_sword', 'stone_sword', 'golden_sword', 'wooden_sword',
  'netherite_axe', 'diamond_axe', 'iron_axe', 'stone_axe', 'golden_axe', 'wooden_axe']
const SCAFFOLD = ['dirt', 'cobblestone', 'cobbled_deepslate', 'netherrack', 'stone', 'andesite', 'diorite', 'granite']

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Blocks the players placed are never broken by the pathfinder (it used to dig
// through house walls to reach a door). Shared by both bots through a file
// kept inside the world folder, so it is saved and loaded with the world.
const fs = require('fs')
const path = require('path')
const PROTECTED_FILE = path.resolve(process.env.MC_WORLD_DIR || path.join(__dirname, '..', '..', 'server', 'data', 'world'), 'agents-protected.jsonl')
let protectedCache = { mtime: 0, set: new Set() }
function protectedSet () {
  try {
    const st = fs.statSync(PROTECTED_FILE)
    if (st.mtimeMs !== protectedCache.mtime) {
      const set = new Set()
      for (const line of fs.readFileSync(PROTECTED_FILE, 'utf8').split('\n')) {
        if (!line) continue
        const [op, key] = line.split(' ')
        if (op === '+') set.add(key); else set.delete(key)
      }
      protectedCache = { mtime: st.mtimeMs, set }
    }
  } catch {}
  return protectedCache.set
}
function protect (p, on = true) {
  if (!fs.existsSync(path.dirname(PROTECTED_FILE))) return
  fs.appendFileSync(PROTECTED_FILE, `${on ? '+' : '-'} ${p.x},${p.y},${p.z}\n`)
}
const NEVER_BREAK = /_door$|_bed$|^crafting_table$|^furnace$|^chest$|^barrel$|glass|torch|^ladder$/

function createLib (getBot, ctl) {
  const bot = () => {
    const b = getBot()
    if (!b || !b.entity) throw new Error('bot is not in the world (dead or reconnecting); try again in a few seconds')
    return b
  }
  const mc = () => require('minecraft-data')(bot().version)
  const v = (x, y, z) => (x instanceof Vec3 ? x : (typeof x === 'object' ? new Vec3(x.x, x.y, x.z) : new Vec3(x, y, z)))
  const here = () => bot().entity.position
  const fmt = (p) => `(${Math.floor(p.x)}, ${Math.floor(p.y)}, ${Math.floor(p.z)})`
  const guard = (start) => { if (ctl.gen() !== start) throw new Error('cancelled: the program timed out') }

  // --- names ----------------------------------------------------------------

  // 'oak_log' | '*_log' | ['oak_log', 'birch_log'] | (block) => bool  ->  block predicate
  function blockMatcher (what) {
    if (typeof what === 'function') return what
    const list = Array.isArray(what) ? what : [what]
    const exact = new Set(list.filter((n) => !n.includes('*')))
    const patterns = list.filter((n) => n.includes('*')).map((n) => new RegExp('^' + n.replace(/\*/g, '.*') + '$'))
    for (const n of exact) if (!mc().blocksByName[n]) throw new Error(`no block named '${n}' (check the exact Minecraft id, e.g. 'oak_log')`)
    return (b) => b && (exact.has(b.name) || patterns.some((r) => r.test(b.name)))
  }

  function itemId (name) {
    const it = mc().itemsByName[name]
    if (!it) throw new Error(`no item named '${name}' (check the exact Minecraft id, e.g. 'oak_planks')`)
    return it.id
  }

  // --- reading the world ------------------------------------------------------

  function inv () {
    const out = {}
    for (const it of bot().inventory.items()) out[it.name] = (out[it.name] || 0) + it.count
    return out
  }

  function count (name) {
    if (name.includes('*')) {
      const r = new RegExp('^' + name.replace(/\*/g, '.*') + '$')
      return Object.entries(inv()).filter(([k]) => r.test(k)).reduce((s, [, c]) => s + c, 0)
    }
    return inv()[name] || 0
  }

  function hostiles (radius = 16) {
    const p = here()
    return Object.values(bot().entities)
      .filter((e) => e !== bot().entity && e.position && HOSTILE.has(e.name) && e.position.distanceTo(p) <= radius)
      .map((e) => ({ name: e.name, id: e.id, pos: fmt(e.position), dist: +e.position.distanceTo(p).toFixed(1), entity: e }))
      .sort((a, b) => a.dist - b.dist)
  }

  function timeInfo () {
    const t = bot().time.timeOfDay
    const night = t >= 12542 && t < 23460
    let phase = 'day'
    if (t >= 12000 && t < 13188) phase = 'dusk (hostile mobs start at 13188)'
    else if (t >= 13188 && t < 22812) phase = 'NIGHT (hostile mobs spawn on the surface)'
    else if (t >= 22812 && t < 23460) phase = 'dawn (undead start burning at 23460)'
    const toNight = t < 13188 ? 13188 - t : 24000 - t + 13188
    return { timeOfDay: t, phase, night, canSleep: night, secondsUntilNight: night ? 0 : Math.round(toNight / 20) }
  }

  // Tools and weapons with the share of durability left, e.g. {iron_pickaxe: '34%'}
  function tools () {
    const out = {}
    for (const it of bot().inventory.items()) {
      if (it.maxDurability) out[it.name] = `${Math.round(100 * (1 - (it.durabilityUsed || 0) / it.maxDurability))}%`
    }
    return out
  }

  function status () {
    const b = bot()
    return {
      tools: tools(),
      pos: fmt(here()), dimension: b.game.dimension, health: +b.health.toFixed(1), food: b.food,
      ...timeInfo(), inventory: inv(), hostiles: hostiles(16).map(({ entity, ...h }) => h)
    }
  }

  // Nearest blocks first. what: see blockMatcher.
  function find (what, { maxDistance = 64, count: n = 1 } = {}) {
    const match = blockMatcher(what)
    return bot().findBlocks({ matching: match, maxDistance, count: Math.max(n, 1) })
      .map((p) => bot().blockAt(p))
      .filter(Boolean)
  }

  function blockAt (x, y, z) { return bot().blockAt(v(x, y, z)) }

  // --- moving -----------------------------------------------------------------

  function movements ({ dig = true } = {}) {
    const b = bot()
    const m = new Movements(b)
    m.canDig = dig // safe now: blocks we placed (and the floor under doors) are never dug, see protect()
    m.allow1by1towers = true
    m.allowSprinting = true
    m.allowParkour = false // parkour jumps are a common cause of falls
    m.digCost = 6 // walk around rather than tunnel: tunnelling wore out two pickaxes in one test
    // blocks the pathfinder may build with: never the last cobblestone, which
    // recipes need (it once spent the cobblestone gathered for a pickaxe)
    const scaffold = SCAFFOLD.filter((n) => !/cobble|^stone$/.test(n) || count(n) > 24)
    m.scafoldingBlocks = scaffold.map((n) => mc().itemsByName[n]?.id).filter((id) => id !== undefined)
    for (const blk of mc().blocksArray) if (NEVER_BREAK.test(blk.name)) m.blocksCantBreak.add(blk.id)
    const prot = protectedSet()
    m.exclusionAreasBreak = [(bl) => (prot.has(`${bl.position.x},${bl.position.y},${bl.position.z}`) ? 100 : 0)]
    return m
  }

  async function goal (g, { timeoutMs = 60000, dig = true } = {}) {
    const b = bot()
    const start = ctl.gen()
    b.pathfinder.setMovements(movements({ dig }))
    b.pathfinder.thinkTimeout = 10000 // default 5 s gives up on long routes through forests
    let timer
    try {
      await Promise.race([
        b.pathfinder.goto(g),
        new Promise((_, rej) => { timer = setTimeout(() => rej(new Error(`could not get there within ${timeoutMs / 1000}s`)), timeoutMs) })
      ])
    } catch (e) {
      b.pathfinder.stop()
      guard(start)
      throw new Error(`movement failed: ${e.message} (now at ${fmt(here())})`)
    } finally { clearTimeout(timer) }
    guard(start)
    return fmt(here())
  }

  const goTo = (x, y, z, range = 1, opts) => goal(new goals.GoalNear(x, y, z, range), opts)
  const goToXZ = (x, z, opts) => goal(new goals.GoalXZ(x, z), opts)
  const goNearBlock = (x, y, z, opts) => goal(new goals.GoalLookAtBlock(v(x, y, z), bot().world, { reach: 4 }), opts)

  // Walk in a direction for a while, until check() returns something truthy.
  async function explore (dx, dz, seconds = 30, check = () => null) {
    const start = ctl.gen()
    const until = Date.now() + seconds * 1000
    while (Date.now() < until) {
      guard(start)
      const found = check()
      if (found) return found
      const p = here()
      try { await goal(new goals.GoalXZ(p.x + dx * 16, p.z + dz * 16), { timeoutMs: 15000 }) } catch (e) { if (/cancelled/.test(e.message)) throw e }
    }
    return check() || null
  }

  // --- items on the ground ----------------------------------------------------

  async function pickup (radius = 8) {
    const start = ctl.gen()
    const before = Object.values(inv()).reduce((s, c) => s + c, 0)
    for (let pass = 0; pass < 3; pass++) {
      const drops = Object.values(bot().entities)
        .filter((e) => e.name === 'item' && e.position.distanceTo(here()) <= radius && Math.abs(e.position.y - here().y) < 4)
        .sort((a, b) => a.position.distanceTo(here()) - b.position.distanceTo(here()))
      if (!drops.length) break
      for (const d of drops) {
        guard(start)
        if (!bot().entities[d.id]) continue
        try { await goal(new goals.GoalNear(d.position.x, d.position.y, d.position.z, 0.5), { timeoutMs: 8000 }) } catch (e) { if (/cancelled/.test(e.message)) throw e }
        await sleep(250)
      }
    }
    return Object.values(inv()).reduce((s, c) => s + c, 0) - before
  }

  // --- digging and collecting -------------------------------------------------

  async function dig (x, y, z) {
    const b = bot()
    const p = v(x, y, z)
    let block = b.blockAt(p)
    if (!block || block.name === 'air' || block.name === 'cave_air') return false
    if (block.name === 'bedrock') throw new Error('bedrock cannot be dug')
    if (protectedSet().has(`${p.x},${p.y},${p.z}`)) protect(p, false) // you asked for it explicitly
    if (b.entity.position.distanceTo(p.offset(0.5, 0.5, 0.5)) > 4.5) await goNearBlock(p.x, p.y, p.z)
    block = b.blockAt(p)
    await b.tool.equipForBlock(block, { requireHarvest: false })
    if (!b.canDigBlock(block)) throw new Error(`cannot reach ${block.name} at ${fmt(p)} from ${fmt(here())}`)
    await b.dig(block, true)
    const after = b.blockAt(p)
    if (after && after.name === block.name) throw new Error(`${block.name} at ${fmt(p)} is still there after digging`)
    return true
  }

  // Mine `n` blocks matching `what` and pick up what drops. Returns the items
  // gained, e.g. {oak_log: 6}. Each block gets at most 25 s; unreachable ones
  // are skipped.
  async function collect (what, n = 1, { maxDistance = 64, maxBelow = 8 } = {}) {
    const start = ctl.gen()
    const b = bot()
    const match = blockMatcher(what)
    const before = inv()
    const skip = new Set()
    let mined = 0
    let failures = 0
    const errors = []
    let travelled = false
    while (mined < n && failures < 6) {
      guard(start)
      const pick = (dist) => b.findBlocks({ matching: match, maxDistance: dist, count: 64 })
        .map((p) => b.blockAt(p))
        .find((bl) => bl && !skip.has(bl.position.toString()) && b.entity.position.y - bl.position.y < maxBelow &&
          !protectedSet().has(`${bl.position.x},${bl.position.y},${bl.position.z}`)) // never strip our own buildings
      let target = pick(maxDistance)
      if (!target && !travelled) {
        // nothing close: look through every loaded chunk and walk over there once
        const far = pick(128)
        if (!far) break
        travelled = true
        try { await goal(new goals.GoalNear(far.position.x, far.position.y, far.position.z, 6), { timeoutMs: 60000 }) } catch (e) { guard(start); errors.push(e.message.split('\n')[0]) }
        target = pick(maxDistance)
      }
      if (!target) break
      const p = target.position
      try {
        if (b.entity.position.distanceTo(p.offset(0.5, 0.5, 0.5)) > 4.3) {
          await goal(new goals.GoalLookAtBlock(p, b.world, { reach: 4 }), { timeoutMs: 25000, dig: true })
        }
        if (await dig(p.x, p.y, p.z)) mined++
        else skip.add(p.toString())
        if (mined && mined % 4 === 0) await pickup(6)
      } catch (e) {
        guard(start)
        skip.add(p.toString())
        failures++
        errors.push(e.message.split('\n')[0])
      }
    }
    await sleep(400)
    await pickup(8)
    const after = inv()
    const gained = {}
    for (const [k, c] of Object.entries(after)) if (c > (before[k] || 0)) gained[k] = c - (before[k] || 0)
    if (!mined) throw new Error(`mined nothing for ${JSON.stringify(what)} within ${maxDistance} blocks${errors.length ? ' (could not reach: ' + errors.slice(-2).join(' | ') + ')' : ''}; explore to find more: lib.explore(dx, dz, 40, () => lib.find(${JSON.stringify(what)})[0])`)
    return gained
  }

  // --- crafting ---------------------------------------------------------------

  async function closeWindows () {
    const b = bot()
    if (b.currentWindow) { try { b.closeWindow(b.currentWindow) } catch {} await sleep(300) }
  }

  // Mineflayer crafts by picking up a whole stack on the cursor. If a craft
  // breaks halfway, that stack stays on the cursor (and is thrown on the ground
  // when a window closes). Put it back into an empty inventory slot.
  async function stowCursor () {
    const b = bot()
    for (let i = 0; i < 3 && b.inventory.selectedItem; i++) {
      const sel = b.inventory.selectedItem
      let slot = b.inventory.slots.findIndex((it, idx) => idx >= 9 && idx <= 44 && it && it.type === sel.type && it.count + sel.count <= it.stackSize)
      if (slot < 0) slot = b.inventory.slots.findIndex((it, idx) => idx >= 9 && idx <= 44 && !it)
      if (slot < 0) return false
      try { await b.clickWindow(slot, 0, 0) } catch {}
      await sleep(250)
    }
    return !b.inventory.selectedItem
  }

  // Put anything stuck in the 2x2 crafting grid (slots 1-4) back into the
  // inventory with shift-clicks (putAway is unreliable right after a failed craft).
  async function clearCraftingGrid () {
    const b = bot()
    await stowCursor()
    await closeWindows() // closing a crafting-table window returns its grid to the inventory
    for (let s = 1; s <= 4; s++) {
      if (b.inventory.slots[s]) { try { await b.clickWindow(s, 0, 1) } catch {} await sleep(200) }
    }
    await sleep(300)
  }

  async function ensureTable () {
    const b = bot()
    let table = b.findBlock({ matching: mc().blocksByName.crafting_table.id, maxDistance: 24 })
    if (table) return table
    if (!count('crafting_table')) {
      if (count('*_planks') < 4) {
        const log = Object.keys(inv()).find((k) => k.endsWith('_log') || k.endsWith('_stem'))
        if (!log) throw new Error('need a crafting table: have no planks and no logs; collect logs first')
        await craft(log.replace(/_log$|_stem$/, '_planks'), 4)
      }
      await craft('crafting_table', 1)
    }
    const spot = await freeSpot()
    await place('crafting_table', spot.x, spot.y, spot.z)
    table = b.blockAt(spot)
    return table
  }

  // An air block next to me, on solid ground, not where I stand.
  function findPlaceSpotNearMe () {
    const b = bot()
    const p = here().floored()
    const spots = []
    for (let dx = -3; dx <= 3; dx++) {
      for (let dz = -3; dz <= 3; dz++) {
        if (Math.abs(dx) <= 1 && Math.abs(dz) <= 1) continue // not where I stand or right next to it
        for (const dy of [0, 1, -1, 2, -2]) {
          const s = p.offset(dx, dy, dz)
          const at = b.blockAt(s)
          const below = b.blockAt(s.offset(0, -1, 0))
          if (at && REPLACEABLE.has(at.name) && at.name !== 'water' && below && below.boundingBox === 'block' && !INTERACTIVE.test(below.name) && !/leaves/.test(below.name)) {
            spots.push(s)
            break
          }
        }
      }
    }
    if (spots.length) {
      spots.sort((a, b2) => a.distanceTo(p) - b2.distanceTo(p))
      return spots[0]
    }
    // tight tunnel: right next to me, beside my feet
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const s = p.offset(dx, 0, dz)
      const at = b.blockAt(s)
      const below = b.blockAt(s.offset(0, -1, 0))
      if (at && REPLACEABLE.has(at.name) && at.name !== 'water' && below && below.boundingBox === 'block' && !INTERACTIVE.test(below.name)) return s
    }
    return null
  }

  // A spot to put a crafting table / furnace / chest: free ground nearby, or a
  // niche dug into the wall beside you when you are in a tunnel.
  async function freeSpot () {
    const s = findPlaceSpotNearMe()
    if (s) return s
    const b = bot()
    const p = here().floored()
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = p.offset(dx, 0, dz)
      const bl = b.blockAt(n)
      const below = b.blockAt(n.offset(0, -1, 0))
      if (bl && bl.boundingBox === 'block' && !INTERACTIVE.test(bl.name) && !protectedSet().has(`${n.x},${n.y},${n.z}`) && below && below.boundingBox === 'block') {
        await dig(n.x, n.y, n.z)
        return n
      }
    }
    throw new Error(`no free spot near ${fmt(p)} to place a block; move to open ground`)
  }

  // Craft until `n` more of `name` are in the inventory.
  async function craft (name, n = 1) {
    const start = ctl.gen()
    const b = bot()
    const id = itemId(name)
    const target = count(name) + n
    const recipesAny = b.recipesAll(id, null, true)
    if (!recipesAny.length) throw new Error(`'${name}' cannot be crafted (it may need smelting, mining or a drop)`)
    const needsTable = recipesAny.every((r) => r.requiresTable)
    let table = null
    if (needsTable || !b.recipesFor(id, null, 1, null).length) {
      table = b.findBlock({ matching: mc().blocksByName.crafting_table.id, maxDistance: 24 })
      if (!table && b.recipesFor(id, null, 1, true).length) table = await ensureTable()
    }
    for (let attempt = 0; attempt < 4 && count(name) < target; attempt++) {
      guard(start)
      if (table && b.entity.position.distanceTo(table.position) > 4) await goNearBlock(table.position.x, table.position.y, table.position.z)
      let recipe = b.recipesFor(id, null, 1, table)[0]
      if (!recipe) { await sleep(800); recipe = b.recipesFor(id, null, 1, table)[0] } // the inventory view can lag after a pickup
      if (!recipe) throw new Error(`cannot craft '${name}': missing ingredients. ${describeRecipe(recipesAny[0])}. Have: ${JSON.stringify(inv())}`)
      const times = Math.ceil((target - count(name)) / recipe.result.count)
      await sleep(250) // crafting right after another action is what usually fails
      try {
        await b.craft(recipe, times, table)
      } catch (e) {
        // Known 1.20 issue: the result slot update sometimes never arrives
        // ("Event updateSlot:0 did not fire"). The items usually were crafted;
        // tidy up and re-check the inventory before retrying.
        await sleep(500)
        await clearCraftingGrid()
      }
      await sleep(200)
      await stowCursor() // also after a "successful" craft: seen holding 36 planks
    }
    const have = count(name)
    if (have < target) throw new Error(`crafted only ${have - (target - n)} of ${n} ${name}. Have: ${JSON.stringify(inv())}`)
    return have
  }

  function describeRecipe (recipe) {
    if (!recipe) return ''
    const need = {}
    const add = (i) => { if (i && i.id !== -1) { const nm = mc().items[i.id]?.name; need[nm] = (need[nm] || 0) + Math.abs(i.count || 1) } }
    if (recipe.inShape) recipe.inShape.flat().forEach(add)
    if (recipe.ingredients) recipe.ingredients.forEach(add)
    return `one craft needs ${JSON.stringify(need)}${recipe.requiresTable ? ' and a crafting table' : ''} and makes ${recipe.result.count}`
  }

  function recipe (name) {
    const r = bot().recipesAll(itemId(name), null, true)
    return r.length ? r.map(describeRecipe).join(' | or | ') : `'${name}' has no crafting recipe`
  }

  // --- placing and building ---------------------------------------------------

  const FACES = [new Vec3(0, -1, 0), new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(0, 1, 0)]
  const REPLACEABLE = new Set(['air', 'cave_air', 'water', 'grass', 'short_grass', 'tall_grass', 'snow', 'fern', 'large_fern', 'dandelion', 'poppy', 'dead_bush'])
  // Right-clicking these opens or uses them instead of placing against them.
  const INTERACTIVE = /chest|crafting_table|furnace|smoker|barrel|door|bed|trapdoor|gate|button|lever|anvil|table|shulker|hopper|dispenser|dropper|loom|stonecutter|grindstone|composter|bell/
  const solid = (bl) => bl && bl.boundingBox === 'block' && !['water', 'lava'].includes(bl.name)

  // Place `name` at x,y,z. Needs a solid neighbour block to place against.
  async function place (name, x, y, z) {
    const start = ctl.gen()
    const b = bot()
    const p = v(x, y, z).floored()
    const existing = b.blockAt(p)
    if (existing && existing.name === name) { protect(p); return 'already there' }
    if (existing && !REPLACEABLE.has(existing.name)) {
      throw new Error(`${fmt(p)} is occupied by ${existing.name}; dig it first (lib.dig)`)
    }
    if (!count(name)) throw new Error(`no ${name} in inventory`)
    let ref = null
    let face = null
    for (const f of FACES) { // prefer plain blocks: clicking a chest opens it
      const n = b.blockAt(p.plus(f))
      if (solid(n) && !INTERACTIVE.test(n.name)) { ref = n; face = f.scaled(-1); break }
    }
    let sneak = false
    if (!ref) {
      for (const f of FACES) {
        const n = b.blockAt(p.plus(f))
        if (solid(n)) { ref = n; face = f.scaled(-1); sneak = true; break }
      }
    }
    if (!ref) throw new Error(`nothing solid next to ${fmt(p)} to place against; place a supporting block first (build bottom-up)`)

    // stand where the block is reachable but not inside it
    const feet = here().floored()
    const inside = (feet.x === p.x && feet.z === p.z && (feet.y === p.y || feet.y + 1 === p.y))
    if (inside || here().distanceTo(p.offset(0.5, 0.5, 0.5)) > 4.2) {
      await goal(new goals.GoalPlaceBlock(p, b.world, { range: 4 }), { timeoutMs: 30000 })
    }
    guard(start)
    await b.equip(itemId(name), 'hand')
    if (sneak) { b.setControlState('sneak', true); await sleep(150) }
    try {
      await b.placeBlock(ref, face)
    } catch (e) {
      await sleep(300) // the server may have placed it even though the event timed out
    } finally {
      if (sneak) b.setControlState('sneak', false)
    }
    const now = b.blockAt(p)
    if (!now || now.name !== name) throw new Error(`could not place ${name} at ${fmt(p)} (it is ${now?.name}); check reach and that no entity stands there`)
    protect(p)
    if (/_door$|_bed$|torch|ladder/.test(name)) protect(p.offset(0, -1, 0)) // its support
    return 'placed'
  }

  // blocks: [{x, y, z, name}] — placed bottom-up, nearest first; already
  // correct blocks are skipped. Blocks that have nothing to stand on yet are
  // retried after the rest of their layer. With {replace: true}, other blocks
  // in the way (grass, dirt, stone...) are dug out first. Returns a report; never
  // throws on a single bad block.
  async function build (blocks, { replace = false, maxFailures = 12 } = {}) {
    const start = ctl.gen()
    const todo = blocks.map((bl) => ({ ...bl, p: v(bl.x, bl.y, bl.z).floored() }))
      .filter((bl) => bot().blockAt(bl.p)?.name !== bl.name)
    const report = { placed: 0, dug: 0, skipped: blocks.length - todo.length, failed: [] }
    const byLayer = {}
    for (const bl of todo) (byLayer[bl.p.y] ||= []).push(bl)
    for (const y of Object.keys(byLayer).map(Number).sort((a, b) => a - b)) {
      let pending = byLayer[y]
      for (let pass = 0; pass < 3 && pending.length; pass++) {
        const retry = []
        pending.sort((a, b) => a.p.distanceTo(here()) - b.p.distanceTo(here()))
        for (const bl of pending) {
          guard(start)
          if (!count(bl.name)) { report.failed.push(`${bl.name} ${fmt(bl.p)}: none left in inventory`); continue }
          try {
            const there = bot().blockAt(bl.p)
            if (replace && there && there.name !== bl.name && !REPLACEABLE.has(there.name)) { await dig(bl.p.x, bl.p.y, bl.p.z); report.dug++ }
            await place(bl.name, bl.p.x, bl.p.y, bl.p.z)
            report.placed++
          } catch (e) {
            if (/cancelled/.test(e.message)) throw e
            if (pass < 2 && !/occupied/.test(e.message)) retry.push(bl)
            else report.failed.push(`${bl.name} ${fmt(bl.p)}: ${e.message.split(';')[0]}`)
          }
          if (report.failed.length >= maxFailures) return report
        }
        pending = retry
      }
    }
    return report
  }

  // Dig out every block in the box (top layer first). Returns how many were dug.
  async function clearArea (x1, y1, z1, x2, y2, z2) {
    const start = ctl.gen()
    let dug = 0
    for (let y = Math.max(y1, y2); y >= Math.min(y1, y2); y--) {
      const layer = []
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) {
          const bl = bot().blockAt(v(x, y, z))
          if (bl && !['air', 'cave_air', 'void_air'].includes(bl.name)) layer.push(bl.position)
        }
      }
      layer.sort((a, b) => a.distanceTo(here()) - b.distanceTo(here()))
      for (const p of layer) {
        guard(start)
        try { if (await dig(p.x, p.y, p.z)) dug++ } catch (e) { if (/cancelled/.test(e.message)) throw e }
      }
    }
    await pickup(8)
    return dug
  }

  // Make the rectangle x1..x2, z1..z2 a flat floor at height y: dig everything
  // from y up to y+clearance-1, and fill holes in the layer below with `fill`.
  async function flatten (x1, z1, x2, z2, y, { fill = 'dirt', clearance = 4 } = {}) {
    const dug = await clearArea(x1, y, z1, x2, y + clearance - 1, z2)
    const holes = []
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) {
        if (!solid(bot().blockAt(v(x, y - 1, z)))) holes.push({ x, y: y - 1, z, name: fill })
      }
    }
    const filled = holes.length ? await build(holes) : { placed: 0, failed: [] }
    return { dug, filled: filled.placed, failed: filled.failed }
  }

  // What a blueprint still needs: {name: count} of blocks not yet in place,
  // and what is missing from the inventory.
  function materials (blocks) {
    const need = {}
    for (const bl of blocks) if (bot().blockAt(v(bl.x, bl.y, bl.z))?.name !== bl.name) need[bl.name] = (need[bl.name] || 0) + 1
    const missing = {}
    for (const [k, c] of Object.entries(need)) if (count(k) < c) missing[k] = c - count(k)
    return { need, missing }
  }

  // Lists of blocks for common shapes; pass the result to lib.build().
  const shapes = {
    box (name, x1, y1, z1, x2, y2, z2) {
      const out = []
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
          for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) out.push({ x, y, z, name })
        }
      }
      return out
    },
    // Nether portal frame: 10 obsidian plus 4 corner blocks (any block; they
    // give the side columns something to be placed against). (x, y, z) is the
    // bottom-left corner; the frame runs along +x ('x') or +z ('z'). The
    // opening is 2 wide and 3 high; light it with lib.ignite(x + 1, y, z).
    portal (x, y, z, axis = 'x', corner = 'cobblestone') {
      const at = (i, j) => (axis === 'x' ? { x: x + i, y: y + j, z } : { x, y: y + j, z: z + i })
      const out = []
      for (const i of [0, 3]) { out.push({ ...at(i, 0), name: corner }, { ...at(i, 4), name: corner }) }
      for (const i of [1, 2]) { out.push({ ...at(i, 0), name: 'obsidian' }, { ...at(i, 4), name: 'obsidian' }) }
      for (const j of [1, 2, 3]) { out.push({ ...at(0, j), name: 'obsidian' }, { ...at(3, j), name: 'obsidian' }) }
      return out
    },
    // Hollow house: floor at y, walls h high, flat roof, door gap and windows.
    // door: 'north' | 'south' | 'east' | 'west' (the wall with the 2-high gap)
    house ({ x, y, z, width = 5, depth = 5, height = 3, wall = 'oak_planks', floor = null, roof = null, door = 'south', windows = true }) {
      const out = []
      const x2 = x + width - 1
      const z2 = z + depth - 1
      const midX = x + Math.floor(width / 2)
      const midZ = z + Math.floor(depth / 2)
      const doorAt = { south: [midX, z2], north: [midX, z], east: [x2, midZ], west: [x, midZ] }[door]
      if (floor) out.push(...shapes.box(floor, x, y - 1, z, x2, y - 1, z2))
      for (let dy = 0; dy < height; dy++) {
        for (let bx = x; bx <= x2; bx++) {
          for (let bz = z; bz <= z2; bz++) {
            const edge = bx === x || bx === x2 || bz === z || bz === z2
            if (!edge) continue
            if (doorAt && bx === doorAt[0] && bz === doorAt[1] && dy < 2) continue
            const corner = (bx === x || bx === x2) && (bz === z || bz === z2)
            const windowSpot = windows && dy === 1 && !corner &&
              ((bz === z || bz === z2) ? (bx - x) % 2 === 1 && bx !== midX : (bz - z) % 2 === 1 && bz !== midZ)
            if (windowSpot && !(doorAt && ((bz === doorAt[1] && (door === 'south' || door === 'north')) || (bx === doorAt[0] && (door === 'east' || door === 'west'))))) continue
            out.push({ x: bx, y: y + dy, z: bz, name: wall })
          }
        }
      }
      out.push(...shapes.box(roof || wall, x - 1, y + height, z - 1, x2 + 1, y + height, z2 + 1))
      return out
    }
  }

  // Open (true) or close (false) the door / trapdoor / gate at x,y,z. The
  // pathfinder does not open doors by itself: open, walk through, close.
  async function door (x, y, z, open = true) {
    const b = bot()
    const p = v(x, y, z)
    let bl = b.blockAt(p)
    if (!bl || !/door|gate/.test(bl.name)) throw new Error(`no door at ${fmt(p)} (found ${bl?.name})`)
    if (bl.getProperties().half === 'upper') { bl = b.blockAt(p.offset(0, -1, 0)) }
    if (bl.getProperties().open === open) return open ? 'already open' : 'already closed'
    if (here().distanceTo(bl.position.offset(0.5, 0.5, 0.5)) > 4) await goNearBlock(bl.position.x, bl.position.y, bl.position.z)
    await b.activateBlock(bl)
    await sleep(300)
    const now = b.blockAt(bl.position).getProperties().open
    if (now !== open) throw new Error(`door at ${fmt(bl.position)} did not ${open ? 'open' : 'close'} (iron doors need redstone)`)
    return open ? 'opened' : 'closed'
  }

  // Walk straight towards (x, z) with the movement keys (the pathfinder can't).
  async function walkTo (x, z, maxMs = 4000) {
    const b = bot()
    const until = Date.now() + maxMs
    try {
      while (Date.now() < until) {
        const pos = here()
        if (Math.hypot(pos.x - x, pos.z - z) < 0.3) return true
        await b.lookAt(new Vec3(x, pos.y + 1.6, z), true)
        b.setControlState('forward', true)
        await sleep(50)
      }
    } finally { b.clearControlStates() }
    return Math.hypot(here().x - x, here().z - z) < 0.6
  }

  // Go through the door at x,y,z to the other side and close it behind you.
  async function goThroughDoor (x, y, z, { close = true } = {}) {
    const b = bot()
    let bl = b.blockAt(v(x, y, z))
    if (!bl || !/door/.test(bl.name)) throw new Error(`no door at ${fmt(v(x, y, z))} (found ${bl?.name})`)
    if (bl.getProperties().half === 'upper') bl = b.blockAt(bl.position.offset(0, -1, 0))
    const d = bl.position
    const facing = bl.getProperties().facing
    const alongZ = facing === 'north' || facing === 'south'
    const side = Math.sign(alongZ ? here().z - (d.z + 0.5) : here().x - (d.x + 0.5)) || 1
    const near = alongZ ? d.offset(0, 0, side) : d.offset(side, 0, 0)
    const far = alongZ ? d.offset(0, 0, -side) : d.offset(-side, 0, 0)
    await goal(new goals.GoalBlock(near.x, near.y, near.z), { timeoutMs: 30000 })
    await door(d.x, d.y, d.z, true)
    await walkTo(d.x + 0.5, d.z + 0.5)
    const ok = await walkTo(far.x + 0.5, far.z + 0.5)
    if (close) await door(d.x, d.y, d.z, false)
    if (!ok) throw new Error(`could not walk through the door at ${fmt(d)}; now at ${fmt(here())}`)
    return `through the door, now at ${fmt(here())}${close ? ', door closed' : ''}`
  }

  // --- containers -------------------------------------------------------------

  async function openNear (blockName, x, y, z) {
    const b = bot()
    const matchId = mc().blocksByName[blockName]?.id
    const matcher = (blk) => blk && (blk.name === blockName || (matchId !== undefined && blk.type === matchId) || blk.name.includes(blockName))
    let block
    if (x !== undefined) {
      const direct = b.blockAt(v(x, y, z))
      if (matcher(direct)) {
        block = direct
      } else {
        block = b.findBlock({ matching: matcher, maxDistance: 4, point: v(x, y, z) })
      }
    }
    if (!block) {
      block = b.findBlock({ matching: matcher, maxDistance: 24 })
    }
    if (!block || !matcher(block)) throw new Error(`no ${blockName} ${x !== undefined ? 'near ' + fmt(v(x, y, z)) : 'within 24 blocks'}`)
    await goNearBlock(block.position.x, block.position.y, block.position.z)
    return block
  }

  // Deposit items into the chest at x,y,z (or the nearest chest). items: {name: count|'all'} or 'all'
  async function deposit (items = 'all', x, y, z) {
    const b = bot()
    await closeWindows()
    const block = await openNear('chest', x, y, z)
    const chest = await b.openContainer(block)
    const moved = {}
    try {
      const keep = new Set(['crafting_table', ...WEAPONS, ...Object.keys(inv()).filter((k) => /_pickaxe$|_axe$|_shovel$|_hoe$|_helmet$|_chestplate$|_leggings$|_boots$/.test(k))])
      const wanted = items === 'all'
        ? Object.fromEntries(Object.entries(inv()).filter(([k]) => !keep.has(k)))
        : Object.fromEntries(Object.entries(items).map(([k, c]) => [k, c === 'all' ? count(k) : c]))
      for (const [name, c] of Object.entries(wanted)) {
        const n = Math.min(c, count(name))
        if (n > 0) { await chest.deposit(itemId(name), null, n); moved[name] = n }
      }
    } finally { chest.close() }
    return moved
  }

  async function withdraw (items, x, y, z) {
    const b = bot()
    await closeWindows()
    const block = await openNear('chest', x, y, z)
    const chest = await b.openContainer(block)
    const moved = {}
    try {
      for (const [name, c] of Object.entries(items)) {
        const inChest = chest.containerItems().filter((i) => i.name === name).reduce((s, i) => s + i.count, 0)
        const n = Math.min(c === 'all' ? inChest : c, inChest)
        if (n > 0) { await chest.withdraw(itemId(name), null, n); moved[name] = n }
      }
    } finally { chest.close() }
    return moved
  }

  async function chestContents (x, y, z) {
    const b = bot()
    await closeWindows()
    const block = await openNear('chest', x, y, z)
    const chest = await b.openContainer(block)
    const out = {}
    for (const i of chest.containerItems()) out[i.name] = (out[i.name] || 0) + i.count
    chest.close()
    return out
  }

  // Smelt `n` of `input` with `fuel` in the nearest furnace (placing one if you carry it).
  async function smelt (input, fuel, n = 1) {
    const start = ctl.gen()
    const b = bot()
    let block = b.findBlock({ matching: mc().blocksByName.furnace.id, maxDistance: 24 })
    if (!block) {
      if (!count('furnace')) throw new Error('no furnace nearby and none in inventory (furnace = 8 cobblestone at a crafting table)')
      const s = await freeSpot()
      await place('furnace', s.x, s.y, s.z)
      block = b.blockAt(s)
    }
    await goNearBlock(block.position.x, block.position.y, block.position.z)
    const furnace = await b.openFurnace(block)
    let got = 0
    try {
      const have = Math.min(n, count(input))
      if (!have) throw new Error(`no ${input} to smelt`)
      const fuelNeeded = Math.ceil(have / (fuel === 'coal' || fuel === 'charcoal' ? 8 : 1.5))
      if (!furnace.fuelItem() && count(fuel) < 1) throw new Error(`no ${fuel} for fuel`)
      if (count(fuel)) await furnace.putFuel(itemId(fuel), null, Math.min(fuelNeeded, count(fuel)))
      await furnace.putInput(itemId(input), null, have)
      const deadline = Date.now() + have * 10500 + 3000
      while (got < have && Date.now() < deadline) {
        guard(start)
        await sleep(1000)
        if (furnace.outputItem()) { got += furnace.outputItem().count; await furnace.takeOutput() }
      }
    } finally { furnace.close() }
    return { smelted: got }
  }

  // --- survival ---------------------------------------------------------------

  async function equipWeapon () {
    const b = bot()
    for (const w of WEAPONS) if (count(w)) { await b.equip(itemId(w), 'hand'); return w }
    return null
  }

  // Fight hostile mobs within `radius` until none are left (or `seconds` pass).
  async function fight (radius = 10, seconds = 30) {
    const start = ctl.gen()
    const b = bot()
    const until = Date.now() + seconds * 1000
    const killed = []
    await equipWeapon()
    while (Date.now() < until) {
      guard(start)
      const target = hostiles(radius).find((h) => h.name !== 'enderman' || h.dist < 4)
      if (!target) break
      const id = target.entity.id
      b.pvp.attack(target.entity)
      while (b.entities[id] && Date.now() < until && b.health > 6) { guard(start); await sleep(250) }
      b.pvp.stop()
      if (!b.entities[id]) killed.push(target.name)
      if (b.health <= 6) throw new Error(`retreated from ${target.name}: health ${b.health.toFixed(1)}. Get away (lib.shelter) and eat`)
    }
    return { killed, health: +b.health.toFixed(1) }
  }

  async function eat () {
    const b = bot()
    if (b.food >= 20) return 'not hungry'
    const food = FOOD_PRIORITY.find((f) => count(f))
    if (!food) throw new Error('no food in inventory (kill animals: cow, pig, sheep, chicken; cook meat in a furnace)')
    await b.equip(itemId(food), 'hand')
    await b.consume()
    return `ate ${food}, food ${b.food}/20`
  }

  // Emergency shelter: dig 2 blocks down where you stand and close the hole
  // above your head. Needs 1-5 dirt/cobblestone. Leave with lib.leaveShelter().
  async function shelter () {
    const b = bot()
    b.pathfinder.stop()
    const top = here().floored()
    const below1 = b.blockAt(top.offset(0, -1, 0))
    const below3 = b.blockAt(top.offset(0, -3, 0))
    if (!solid(below3) || ['sand', 'gravel'].includes(below1?.name)) {
      throw new Error(`unsafe to dig down here (${below3?.name} 3 blocks below, ${below1?.name} under feet); move to solid ground and retry`)
    }
    const filler = SCAFFOLD.find((n) => count(n)) || Object.keys(inv()).find((k) => k.endsWith('_planks'))
    if (!filler) throw new Error(`need at least 2 blocks (dirt/cobblestone/planks) to seal a shelter; inventory: ${JSON.stringify(inv())}. If it is empty you probably just died`)
    await b.dig(b.blockAt(top.offset(0, -1, 0)), true)
    await sleep(600)
    await b.dig(b.blockAt(top.offset(0, -2, 0)), true)
    await sleep(800)
    const feet = here().floored()
    // seal the sides of both body blocks if they are open
    for (const dy of [0, 1]) {
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const s = feet.offset(dx, dy, dz)
        if (!solid(b.blockAt(s)) && count(filler)) { try { await place(filler, s.x, s.y, s.z) } catch {} }
      }
    }
    const roof = feet.offset(0, 2, 0)
    if (!solid(b.blockAt(roof))) await place(filler, roof.x, roof.y, roof.z)
    return `sheltered at ${fmt(feet)}; wait for day (lib.time().phase) then lib.leaveShelter()`
  }

  async function leaveShelter () {
    const b = bot()
    const feet = here().floored()
    for (const dy of [2, 3]) {
      const bl = b.blockAt(feet.offset(0, dy, 0))
      if (bl && bl.name !== 'air') await b.dig(bl, true)
    }
    await goal(new goals.GoalY(feet.y + 2), { timeoutMs: 20000 })
    return fmt(here())
  }

  async function sleepInBed () {
    const b = bot()
    const bed = b.findBlock({ matching: (bl) => b.isABed(bl), maxDistance: 32 })
    if (!bed) throw new Error('no bed within 32 blocks (bed = 3 wool + 3 planks at a crafting table)')
    if (!timeInfo().canSleep) throw new Error(`can only sleep at night or in a thunderstorm (time ${b.time.timeOfDay}, sleep from 12542)`)
    await goNearBlock(bed.position.x, bed.position.y, bed.position.z)
    await b.sleep(bed)
    return 'sleeping; the night is skipped when every player is in bed'
  }

  // Swing at hostiles that come within 3.5 blocks, from wherever you are,
  // without moving. Runs in the background until lib.reflexes(false).
  let reflexTimer = null
  function reflexes (on = true) {
    if (reflexTimer) { clearInterval(reflexTimer); reflexTimer = null }
    if (!on) return 'reflexes off'
    reflexTimer = setInterval(() => {
      const b = getBot()
      if (!b || !b.entity) return
      // don't drown: swim up when running out of air (a test bot drowned idling in water)
      // air is reported in ticks (0-300) on this version, in bubbles (0-20) on older ones
      const airMax = b.oxygenLevel > 20 ? 300 : 20
      if (b.oxygenLevel !== undefined && b.oxygenLevel < airMax * 0.6) {
        b.setControlState('jump', true)
        setTimeout(() => { try { b.setControlState('jump', false) } catch {} }, 500)
      }
      if (b.pvp?.target) return
      const h = Object.values(b.entities).find((e) => e.position && HOSTILE.has(e.name) && e.name !== 'creeper' &&
        e.position.distanceTo(b.entity.position) < 3.5)
      if (h) { b.lookAt(h.position.offset(0, h.height * 0.8, 0), true).then(() => b.attack(h)).catch(() => {}) }
    }, 600)
    return 'reflexes on: will hit hostile mobs within 3.5 blocks and swim up when out of air'
  }

  // --- iron age -------------------------------------------------------------

  const ARMOR_TIERS = ['netherite', 'diamond', 'iron', 'chainmail', 'golden', 'turtle', 'leather']
  // Wear the best helmet, chestplate, leggings and boots you carry, and a shield in the off hand.
  async function equipArmor () {
    const b = bot()
    const worn = {}
    const slots = { head: 5, torso: 6, legs: 7, feet: 8 } // armor slots of the player inventory
    for (const [slot, piece] of [['head', 'helmet'], ['torso', 'chestplate'], ['legs', 'leggings'], ['feet', 'boots']]) {
      const current = b.inventory.slots[slots[slot]]?.name
      const rank = (n) => (n ? ARMOR_TIERS.indexOf(n.split('_')[0]) : 99)
      const best = ARMOR_TIERS.map((t) => `${t}_${piece}`).find((n) => count(n))
      if (best && rank(best) < rank(current)) { await b.equip(itemId(best), slot); worn[slot] = best } else if (current) worn[slot] = current
    }
    if (count('shield')) { await b.equip(itemId('shield'), 'off-hand'); worn['off-hand'] = 'shield' }
    return worn
  }

  // Kill `n` animals (or monsters) of a kind and pick up the drops. Walks up
  // to 40 s looking for them. Returns what was gained.
  async function hunt (mob, n = 1) {
    const start = ctl.gen()
    const b = bot()
    const before = inv()
    let killed = 0
    await equipWeapon()
    for (let i = 0; i < n; i++) {
      guard(start)
      const find = () => Object.values(b.entities).filter((e) => e.name === mob && e.position && e.position.distanceTo(here()) < 64)
        .sort((x, y) => x.position.distanceTo(here()) - y.position.distanceTo(here()))[0]
      let target = find()
      if (!target) {
        const [dx, dz] = [[1, 0], [0, 1], [-1, 0], [0, -1]][Math.floor(Math.random() * 4)]
        target = await explore(dx, dz, 40, find)
      }
      if (!target) break
      const id = target.id
      const deadline = Date.now() + 30000
      b.pvp.attack(target)
      while (b.entities[id] && Date.now() < deadline) { guard(start); await sleep(250) }
      b.pvp.stop()
      if (!b.entities[id]) { killed++; await sleep(600); await pickup(6) }
    }
    const gained = {}
    for (const [k, c] of Object.entries(inv())) if (c > (before[k] || 0)) gained[k] = c - (before[k] || 0)
    if (!killed) throw new Error(`no ${mob} found within reach after exploring; try another area (animals live on grass, not in deserts)`)
    return { killed, gained }
  }

  // Fill an empty bucket from the nearest water or lava source block that has
  // open air above it (you scoop from the surface).
  async function fillBucket (liquid = 'water') {
    const b = bot()
    if (!count('bucket')) throw new Error('no empty bucket (bucket = 3 iron ingots)')
    const want = `${liquid}_bucket`
    const before = count(want)
    const sources = b.findBlocks({ matching: (bl) => bl && bl.name === liquid && bl.metadata === 0, maxDistance: 64, count: 200 })
      .map((p) => b.blockAt(p)).filter((bl) => bl && b.blockAt(bl.position.offset(0, 1, 0))?.name === 'air')
      .sort((x, y) => x.position.distanceTo(here()) - y.position.distanceTo(here()))
    if (!sources.length) throw new Error(`no ${liquid} with an open surface within 64 blocks (rivers, lakes, the sea)`)
    for (const src of sources.slice(0, 3)) {
      const p = src.position
      try { await goal(new goals.GoalNear(p.x, p.y + 1, p.z, 2), { timeoutMs: 40000 }) } catch (e) { continue }
      await b.equip(itemId('bucket'), 'hand')
      await b.lookAt(p.offset(0.5, 0.9, 0.5), true) // the surface of the source
      await sleep(150)
      b.activateItem()
      await sleep(700)
      if (count(want) > before) return `filled ${want} at ${fmt(p)}`
    }
    throw new Error(`bucket did not fill from ${liquid}; tried ${sources.slice(0, 3).map((s2) => fmt(s2.position)).join(', ')}`)
  }

  // Set your respawn point at the nearest bed (right-click it by day).
  async function setSpawn () {
    const b = bot()
    const bed = b.findBlock({ matching: (bl) => b.isABed(bl), maxDistance: 32 })
    if (!bed) throw new Error('no bed within 32 blocks')
    if (timeInfo().canSleep) return sleepInBed()
    await goNearBlock(bed.position.x, bed.position.y, bed.position.z)
    await b.activateBlock(bed)
    await sleep(500)
    return `spawn point set at the bed ${fmt(bed.position)}`
  }

  // Place a torch on the floor next to you (monsters don't spawn near light).
  async function placeTorch () {
    if (!count('torch')) throw new Error('no torches (torch = coal or charcoal + stick → 4)')
    const s = await freeSpot()
    await place('torch', s.x, s.y, s.z)
    return `torch at ${fmt(s)}`
  }

  // Dig a staircase down to height `targetY` (diamonds: -58..16, best around
  // -54). Steps one block forward and one down at a time, never digs straight
  // down, turns away from lava and water, fills holes under the next step and
  // puts a torch every 8 steps. Walk back up the same stairs with lib.goTo.
  async function descend (targetY, { torchEvery = 8 } = {}) {
    const start = ctl.gen()
    const b = bot()
    const LIQUID = /lava|water/
    const filler = () => SCAFFOLD.find((n) => count(n))
    const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]]
    let d = Math.floor(Math.random() * 4)
    let steps = 0
    let sideways = 0
    const near = (p, r) => { // any liquid within r blocks of p
      for (let x = -r; x <= r; x++) for (let y = -1; y <= 2; y++) for (let z = -r; z <= r; z++) {
        const bl = b.blockAt(p.offset(x, y, z)); if (bl && LIQUID.test(bl.name)) return bl
      }
      return null
    }
    const pickaxes = () => Object.keys(inv()).filter((k) => k.endsWith('_pickaxe'))
    while (here().y > targetY + 0.5) {
      guard(start)
      // every step digs 3 blocks; a 100-step staircase wore out three pickaxes in a test
      if (!pickaxes().length) throw new Error(`no pickaxe left at ${fmt(here())} after ${steps} steps; craft spares (lib.obtain('stone_pickaxe', 3)) before going deeper`)
      const f = here().floored()
      let ok = false
      for (let turn = 0; turn < 4 && !ok; turn++) {
        const [dx, dz] = dirs[(d + turn) % 4]
        const next = f.offset(dx, -1, dz)
        if (!near(next, 1)) { d = (d + turn) % 4; ok = true }
      }
      if (!ok) {
        // no safe step down: tunnel sideways on this level, then try again
        let moved = false
        for (let turn = 0; turn < 4 && !moved; turn++) {
          const [sx, sz] = dirs[(d + turn) % 4]
          if (near(f.offset(sx, 0, sz), 1) || near(f.offset(sx * 2, 0, sz * 2), 1)) continue
          for (let k = 1; k <= 3; k++) {
            for (const p of [f.offset(sx * k, 0, sz * k), f.offset(sx * k, 1, sz * k)]) {
              const bl = b.blockAt(p)
              if (bl && bl.boundingBox === 'block') await dig(p.x, p.y, p.z)
            }
          }
          await walkTo(f.x + sx * 3 + 0.5, f.z + sz * 3 + 0.5, 4000)
          moved = here().floored().distanceTo(f) >= 2
          sideways++
        }
        if (!moved || sideways > 8) throw new Error(`liquid on every side at ${fmt(f)}; stopped the staircase here (y ${f.y}). Go back up, or block the liquid with cobblestone and retry`)
        continue
      }
      const [dx, dz] = dirs[d]
      const next = f.offset(dx, -1, dz)
      for (const p of [f.offset(dx, 1, dz), f.offset(dx, 0, dz), next]) { // head room, step-over, new feet
        const bl = b.blockAt(p)
        if (bl && bl.boundingBox === 'block') await dig(p.x, p.y, p.z)
      }
      const under = b.blockAt(next.offset(0, -1, 0))
      if (!under || under.boundingBox !== 'block') {
        if (!filler()) throw new Error(`hole under the next step at ${fmt(next)} and no cobblestone/dirt to fill it`)
        await place(filler(), next.x, next.y - 1, next.z).catch(() => {})
      }
      await walkTo(next.x + 0.5, next.z + 0.5, 3000)
      await sleep(250)
      if (here().floored().y > f.y - 1) { // didn't drop: try once more
        await walkTo(next.x + 0.5, next.z + 0.5, 2000)
      }
      steps++
      if (torchEvery && steps % torchEvery === 0 && count('torch')) {
        const t = here().floored().offset(-dx, 1, -dz) // on the step behind, at foot level
        await place('torch', t.x, t.y, t.z).catch(() => {})
      }
    }
    return `reached ${fmt(here())} after ${steps} steps; the stairs lead back up`
  }

  // Light the top of the block at x,y,z with flint and steel (portals, fire).
  async function ignite (x, y, z) {
    const b = bot()
    if (!count('flint_and_steel')) throw new Error('no flint_and_steel (iron_ingot + flint)')
    const block = b.blockAt(v(x, y, z))
    if (!block || block.boundingBox !== 'block') throw new Error(`no solid block at ${fmt(v(x, y, z))} to light`)
    await goNearBlock(x, y, z)
    await b.equip(itemId('flint_and_steel'), 'hand')
    await b.activateBlock(block, new Vec3(0, 1, 0))
    await sleep(800)
    const above = b.blockAt(v(x, y + 1, z))
    return `lit: ${above?.name} above ${fmt(block.position)}`
  }

  // Turn lava into obsidian with a water bucket and mine it (needs a diamond
  // pickaxe and a water_bucket). Pours water onto a solid block at the edge of
  // a lava pool: the water flows over the lava and turns the lava source
  // blocks it touches into obsidian. Then takes the water back and mines.
  async function makeObsidian (n = 10) {
    const start = ctl.gen()
    const b = bot()
    if (!count('diamond_pickaxe')) throw new Error('obsidian can only be mined with a diamond_pickaxe')
    const log = []
    for (let round = 0; round < 8 && count('obsidian') < n; round++) {
      guard(start)
      if (!count('water_bucket')) {
        if (!count('bucket')) throw new Error('need a bucket (3 iron) to carry water')
        log.push(await fillBucket('water'))
      }
      // a lava source at a pool surface with a solid edge block next to it
      const pools = b.findBlocks({ matching: (bl) => bl && bl.name === 'lava' && bl.metadata === 0, maxDistance: 48, count: 64 })
        .map((p) => b.blockAt(p)).filter(Boolean)
        .sort((x, y) => x.position.distanceTo(here()) - y.position.distanceTo(here()))
      let edge = null
      for (const lava of pools) {
        const up = b.blockAt(lava.position.offset(0, 1, 0))
        if (!up || up.name !== 'air') continue
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nb = b.blockAt(lava.position.offset(dx, 0, dz))
          const nbUp = b.blockAt(lava.position.offset(dx, 1, dz))
          if (nb && nb.boundingBox === 'block' && nbUp && nbUp.name === 'air') { edge = nb; break }
        }
        if (edge) break
      }
      if (!edge) throw new Error(`no lava pool with a solid edge within 48 blocks${count('obsidian') ? ` (made ${count('obsidian')} obsidian so far)` : ''}`)
      const e = edge.position
      await goal(new goals.GoalNear(e.x, e.y + 1, e.z, 3), { timeoutMs: 40000 })
      await b.equip(itemId('water_bucket'), 'hand')
      await b.lookAt(e.offset(0.5, 1, 0.5), true)
      b.activateItem()
      await sleep(3000) // let the water spread over the lava
      const water = b.blockAt(e.offset(0, 1, 0))
      if (water && water.name === 'water') {
        await b.equip(itemId('bucket'), 'hand')
        await b.lookAt(e.offset(0.5, 1.5, 0.5), true)
        b.activateItem()
        await sleep(600)
      }
      const obs = b.findBlocks({ matching: (bl) => bl && bl.name === 'obsidian', maxDistance: 8, count: 20 })
      log.push(`round ${round + 1}: water at ${fmt(e.offset(0, 1, 0))}, ${obs.length} obsidian formed`)
      for (const p of obs) {
        if (count('obsidian') >= n) break
        guard(start)
        try { await dig(p.x, p.y, p.z); await pickup(4) } catch (err) { if (/cancelled/.test(err.message)) throw err }
      }
    }
    if (count('obsidian') < n) throw new Error(`made only ${count('obsidian')}/${n} obsidian: ${log.join('; ')}`)
    return { obsidian: count('obsidian'), log }
  }

  const api = {
    makeObsidian,
    descend, ignite,
    equipArmor, hunt, fillBucket, setSpawn, placeTorch, tools,
    v, sleep, fmt, inv, count, status, time: timeInfo, hostiles: (r) => hostiles(r).map(({ entity, ...h }) => h),
    find, blockAt, goTo, goToXZ, goNearBlock, explore, pickup, dig, collect,
    craft, recipe, door, goThroughDoor, walkTo, protect: (x, y, z, on = true) => protect(v(x, y, z).floored(), on), ensureTable, stowCursor, freeSpot, place, build, materials, clearArea, flatten, shapes, deposit, withdraw, chestContents, smelt,
    equipWeapon, fight, eat, shelter, leaveShelter, sleepInBed, reflexes, clearCraftingGrid, closeWindows
  }
  api.obtain = attachObtain(api, { bot, mc, ctl, sleep })
  return api
}

module.exports = { createLib, HOSTILE }
