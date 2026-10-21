// lib.obtain(name, n): get at least n of an item, working out the whole chain
// of prerequisites from the game data (recipes, what drops from which block,
// which tool can harvest it, what smelts into what, which mob drops it).
// The idea of recursive prerequisites comes from Odyssey (zju-vipa/Odyssey,
// MIT): "mineDiamond" crafts an iron pickaxe first when it has none. Instead
// of one hand-written skill per item, this derives the chain for any item.

// What smelts into what (first entry preferred).
const SMELT = {
  iron_ingot: ['raw_iron'], gold_ingot: ['raw_gold'], copper_ingot: ['raw_copper'],
  glass: ['sand', 'red_sand'], stone: ['cobblestone'], smooth_stone: ['stone'], charcoal: ['oak_log', 'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log', 'mangrove_log', 'cherry_log'],
  cooked_beef: ['beef'], cooked_porkchop: ['porkchop'], cooked_mutton: ['mutton'], cooked_chicken: ['chicken'],
  cooked_rabbit: ['rabbit'], cooked_cod: ['cod'], cooked_salmon: ['salmon'], baked_potato: ['potato'],
  brick: ['clay_ball'], dried_kelp: ['kelp']
}
// Items that come from animals or monsters.
const MOB_DROPS = {
  leather: ['cow'], beef: ['cow'], porkchop: ['pig'], mutton: ['sheep'], white_wool: ['sheep'],
  chicken: ['chicken'], feather: ['chicken'], egg: ['chicken'], rabbit: ['rabbit'], rabbit_hide: ['rabbit'],
  string: ['spider'], spider_eye: ['spider'], bone: ['skeleton'], arrow: ['skeleton'], gunpowder: ['creeper'],
  rotten_flesh: ['zombie'], ender_pearl: ['enderman'], blaze_rod: ['blaze'], slime_ball: ['slime']
}
// Recipes we never use to obtain the base material (they consume storage blocks).
const STORAGE = /_block$|_nugget$|^raw_\w+_block$/
const PICKAXES = ['wooden_pickaxe', 'stone_pickaxe', 'iron_pickaxe', 'diamond_pickaxe', 'netherite_pickaxe']
const FUELS = ['coal', 'charcoal', 'oak_planks', 'birch_planks', 'spruce_planks', 'jungle_planks', 'acacia_planks', 'dark_oak_planks', 'mangrove_planks', 'cherry_planks',
  'oak_log', 'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log', 'mangrove_log', 'cherry_log']
// Deep ores: collect is allowed to dig this far below the player.
const DEEP = /_ore$|ancient_debris|obsidian/
// Where an ore is most common; descend there when none is in reach.
const ORE_Y = { diamond: -54, redstone: -54, lapis: 0, gold: -16, emerald: 100, iron: 16, copper: 48, coal: 96 }

function attachObtain (lib, { bot, mc, ctl, sleep }) {
  const log = [] // steps of the current obtain call, returned for the agent to read
  const state = { dead: false }

  const countOf = (name) => lib.count(name)

  function minedFrom (itemName) {
    const id = mc().itemsByName[itemName]?.id
    if (id === undefined) return []
    return mc().blocksArray.filter((b) => (b.drops || []).some((d) => (typeof d === 'object' ? d.drop?.id ?? d.drop : d) === id))
  }

  function cheapestTool (block) {
    if (!block.harvestTools) return null
    const ok = Object.keys(block.harvestTools).map((i) => mc().items[i].name)
    if (ok.some((t) => countOf(t) > 0)) return null // already have one
    return PICKAXES.find((p) => ok.includes(p)) || ok[0]
  }

  // Ingredients of one craft: {name: count}
  function ingredients (recipe) {
    const need = {}
    const add = (i) => { if (i && i.id !== -1) { const nm = mc().items[i.id].name; need[nm] = (need[nm] || 0) + Math.abs(i.count || 1) } }
    if (recipe.inShape) recipe.inShape.flat().forEach(add)
    if (recipe.ingredients) recipe.ingredients.forEach(add)
    return need
  }

  // Rough cost of getting `count` of `name` from what we carry (lower is better).
  function costOf (name, count, result) {
    // recolouring recipes (a white bed from a black bed + dye) lead into loops
    const family = result && result.split('_').slice(-1)[0]
    if (family && name !== result && name.endsWith('_' + family) && /bed|wool|carpet|banner|concrete|terracotta|glass|candle|shulker/.test(family)) return 5000
    const have = countOf(name)
    if (have >= count) return 0
    const miss = count - have
    if (name.endsWith('_planks')) {
      const logName = name.replace('_planks', '_log')
      if (countOf(logName) * 4 >= miss) return 1
      if (mc().blocksByName[logName] && lib.find(logName, { maxDistance: 64 }).length) return 5 * miss // that tree grows nearby
    }
    if (STORAGE.test(name)) return 1000
    return 10 * miss
  }

  async function obtain (name, n = 1, depth = 0, stack = []) {
    const start = ctl.gen()
    const guard = () => {
      if (ctl.gen() !== start) throw new Error('cancelled: the program timed out')
      if (state.dead) throw new Error('cancelled: you died')
    }
    if (!mc().itemsByName[name]) throw new Error(`no item named '${name}'`)
    if (countOf(name) >= n) return
    if (depth > 14 || stack.includes(name)) throw new Error(`can't work out how to get ${name} (chain: ${[...stack, name].join(' → ')})`)
    const chain = [...stack, name]
    const indent = '  '.repeat(depth)
    const step = (msg) => { log.push(`${indent}${msg}`) }
    guard()

    // flint: dig gravel until one drops
    if (name === 'flint') {
      step(`flint: digging gravel until flint drops`)
      for (let i = 0; i < 25 && countOf('flint') < n; i++) {
        guard()
        await lib.collect('gravel', 1)
        // gravel that dropped as gravel: put it back and dig again
        if (countOf('gravel') && countOf('flint') < n) {
          const s = await lib.freeSpot()
          await lib.place('gravel', s.x, s.y, s.z)
          lib.protect(s.x, s.y, s.z, false)
          await lib.dig(s.x, s.y, s.z)
          await lib.pickup(4)
        }
      }
      if (countOf('flint') < n) throw new Error('no flint after 25 gravel; find more gravel')
      return
    }

    // 1. smelting
    if (SMELT[name]) {
      for (let round = 0; round < 3 && countOf(name) < n; round++) {
        guard()
        const missing = n - countOf(name)
        const input = SMELT[name].find((i) => countOf(i) > 0) || SMELT[name][0]
        step(`${name} ×${missing}: smelt ${input}`)
        await obtain(input, Math.max(countOf(input), missing), depth + 1, chain)
        // fuel: coal/charcoal smelt 8 items, planks and logs 1.5
        const fuelPower = () => (countOf('coal') + countOf('charcoal')) * 8 + FUELS.slice(2).filter((f) => f !== input).reduce((s2, f) => s2 + countOf(f) * 1.5, 0)
        if (fuelPower() < missing) {
          step(`fuel for ${missing} items`)
          await obtain('coal', Math.ceil(missing / 8), depth + 1, chain).catch(async () => {
            await obtain('oak_planks', Math.ceil(missing / 1.5) + 1, depth + 1, chain).catch(() => {})
          })
        }
        const fuel = FUELS.find((f) => f !== input && countOf(f) > 0)
        if (!fuel) throw new Error(`no fuel to smelt ${input} (coal, charcoal, planks or logs)`)
        // only now: gathering may have taken us far from the last furnace
        if (!countOf('furnace') && !lib.find('furnace', { maxDistance: 24 }).length) await obtain('furnace', 1, depth + 1, chain)
        await lib.smelt(input, fuel, missing)
      }
      if (countOf(name) >= n) return
      throw new Error(`smelting fell short: have ${countOf(name)}/${n} ${name}`)
    }

    // 2. crafting
    const id = mc().itemsByName[name].id
    const recipes = bot().recipesAll(id, null, true)
      .filter((r) => !Object.keys(ingredients(r)).some((i) => STORAGE.test(i) && countOf(i) === 0))
    if (recipes.length && !MOB_DROPS[name] && !SMELT[name]) {
      const missing = n - countOf(name)
      const best = recipes
        .map((r) => { const ing = ingredients(r); const times = Math.ceil(missing / r.result.count); return { r, ing, times, cost: Object.entries(ing).reduce((s, [k, c]) => s + costOf(k, c * times, name), 0) } })
        .sort((a, b) => a.cost - b.cost)[0]
      step(`${name} ×${missing}: craft ${best.times}× from ${JSON.stringify(best.ing)}`)
      // the table first: making it later would eat planks gathered for the recipe
      if (best.r.requiresTable && !lib.find('crafting_table', { maxDistance: 24 }).length && !countOf('crafting_table')) {
        await obtain('crafting_table', 1, depth + 1, chain)
      }
      // ingredients can consume each other (sticks are made of planks), so
      // repeat until all of them are in the inventory at the same time
      for (let pass = 0; pass < 4; pass++) {
        const short = Object.entries(best.ing).filter(([ing, c]) => countOf(ing) < c * best.times)
        if (!short.length) break
        for (const [ing, c] of short) {
          guard()
          await obtain(ing, c * best.times, depth + 1, chain)
        }
      }
      await lib.craft(name, n - countOf(name))
      if (countOf(name) >= n) return
    }

    // 3. animals and monsters
    if (MOB_DROPS[name]) {
      step(`${name}: hunt ${MOB_DROPS[name].join('/')}`)
      for (let tries = 0; tries < 12 && countOf(name) < n; tries++) {
        guard()
        await lib.hunt(MOB_DROPS[name][0], 1)
      }
      if (countOf(name) >= n) return
      throw new Error(`could not get ${n} ${name} by hunting ${MOB_DROPS[name][0]}; find more of them`)
    }

    // obsidian: there is rarely any lying around; make it from lava + water
    if (name === 'obsidian') {
      if (!countOf('diamond_pickaxe')) await obtain('diamond_pickaxe', 1, depth + 1, chain)
      const ready = lib.find('obsidian', { maxDistance: 32 }).length
      if (!ready) {
        if (!countOf('water_bucket') && !countOf('bucket')) await obtain('bucket', 1, depth + 1, chain)
        step(`obsidian ×${n - countOf(name)}: pour water on lava (lib.makeObsidian)`)
        await lib.makeObsidian(n)
        return
      }
    }

    // 4. mining
    const sources = minedFrom(name).filter((b) => !/infested|budding|spawner/.test(b.name))
    if (sources.length) {
      const tool = cheapestTool(sources[0])
      if (tool) { step(`${name} needs ${tool}`); await obtain(tool, 1, depth + 1, chain) }
      const names = sources.map((b) => b.name)
      const deep = DEEP.test(names[0])
      let explored = false
      // a drop can be lost (fell into a hole, lava): retry until the count is right
      for (let attempt = 0; attempt < 6; attempt++) {
        guard()
        if (countOf(name) >= n) { await sleep(700); if (countOf(name) >= n) break }
        const missing = n - countOf(name)
        step(`${name} ×${missing}: mine ${names.slice(0, 4).join('/')}${names.length > 4 ? '…' : ''}`)
        try {
          await lib.collect(names, missing, { maxBelow: deep ? 48 : 8, maxDistance: deep ? 32 : 64 })
          await sleep(800) // drops from ore fall and roll; give them time, then sweep
          await lib.pickup(10)
        } catch (e) {
          if (/cancelled/.test(e.message) || explored) throw e
          const ore = Object.keys(ORE_Y).find((k) => names[0].includes(k))
          const y = bot().entity.position.y
          if (ore && y - ORE_Y[ore] > 24 && ORE_Y[ore] < y) {
            // a deep staircase digs ~3 blocks per step: bring spare pickaxes
            const spares = Object.keys(lib.inv()).filter((k) => k.endsWith('_pickaxe')).reduce((c, k) => c + countOf(k), 0)
            if (spares < 3) { step('spare pickaxes for the staircase'); await obtain('stone_pickaxe', countOf('stone_pickaxe') + 3 - spares, depth + 1, chain) }
            step(`no ${names[0]} in reach: staircase down to y ${ORE_Y[ore]}`)
            for (let move = 0; ; move++) {
              try { await lib.descend(ORE_Y[ore]); break } catch (err) {
                if (!/liquid/.test(err.message) || move >= 2) throw err
                // water or lava all around (lakes, aquifers): go up and start somewhere else
                const p = bot().entity.position
                const a = Math.random() * Math.PI * 2
                step(`  liquid around ${Math.floor(p.x)}, ${Math.floor(p.y)}, ${Math.floor(p.z)}: moving ~28 blocks away to start new stairs`)
                await lib.goToXZ(Math.floor(p.x + 28 * Math.cos(a)), Math.floor(p.z + 28 * Math.sin(a)), { timeoutMs: 60000 }).catch(() => {})
              }
            }
            continue
          }
          explored = true
          step(`none in reach; exploring for ${names[0]}`)
          const [dx, dz] = [[1, 0], [0, 1], [-1, 0], [0, -1]][Math.floor(Math.random() * 4)]
          const found = await lib.explore(dx, dz, 45, () => lib.find(names, { maxDistance: 48 })[0])
          if (!found) throw new Error(`could not find ${names[0]} to get ${name}; explore farther or try another area`)
        }
      }
      await sleep(1000) // the inventory view can briefly over-count after pickups
      if (countOf(name) >= n) return
      throw new Error(`mined but still have only ${countOf(name)}/${n} ${name}`)
    }
    throw new Error(`don't know how to get ${name}: no recipe, smelting, block or mob source`)
  }

  return async function obtainTop (name, n = 1) {
    log.length = 0
    // stop at once when the player dies: the inventory is gone, carrying on
    // would silently start the whole chain again from nothing
    const b = bot()
    let deathAt = null
    state.dead = false
    const onDeath = () => { deathAt = b.entity ? b.entity.position.floored() : null; state.dead = true }
    const stopOnDeath = state
    b.once('death', onDeath)
    const deathWatch = setInterval(() => { if (stopOnDeath.dead) { try { b.pathfinder.stop(); b.stopDigging() } catch {} } }, 200)
    try {
      await Promise.race([
        obtain(name, n),
        new Promise((_, rej) => { const t = setInterval(() => { if (stopOnDeath.dead) { clearInterval(t); rej(new Error(`you died${deathAt ? ` at ${deathAt.x}, ${deathAt.y}, ${deathAt.z}` : ''} while getting ${name}; your items lie there for 5 minutes`)) } }, 200) })
      ])
    } catch (e) {
      e.message = `${e.message}\nsteps so far:\n${log.join('\n')}`
      throw e
    } finally {
      clearInterval(deathWatch)
      b.removeListener('death', onDeath)
    }
    await sleep(200)
    return { have: countOf(name), steps: log.slice() }
  }
}

module.exports = { attachObtain, SMELT, MOB_DROPS }
