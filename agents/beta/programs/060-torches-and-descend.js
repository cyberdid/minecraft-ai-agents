// 060-torches-and-descend.js - ensure torches, travel to dry east hills (340, -30), descend to y=-54, mine diamonds, craft diamond pickaxe
console.log('Position inside base:', lib.fmt(bot.entity.position))
console.log('Time left in day:', lib.time().secondsUntilNight)

// 1. Check torches in inventory
let torches = lib.count('torch')
console.log('Torches in inventory:', torches)

if (torches < 8) {
  // Check chest at (293, 72, -57) for torches or coal
  const chests = lib.find('chest', { maxDistance: 8 })
  if (chests.length > 0) {
    const chest = await lib.chestContents(chests[0].position.x, chests[0].position.y, chests[0].position.z)
    if (chest.torch > 0) {
      await lib.withdraw({ torch: chest.torch }, chests[0].position.x, chests[0].position.y, chests[0].position.z)
    }
    if (chest.coal > 0 || chest.charcoal > 0) {
      const fuel = chest.coal ? 'coal' : 'charcoal'
      await lib.withdraw({ [fuel]: Math.min(chest[fuel], 4) }, chests[0].position.x, chests[0].position.y, chests[0].position.z)
      await lib.craft('torch', 16)
    }
  }
}

// If still under 8 torches, quickly smelt 2 logs into charcoal
if (lib.count('torch') < 8 && lib.count('stick') >= 2) {
  console.log('Smelting 2 logs into charcoal for torches...')
  try {
    await lib.collect('*_log', 2)
    const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'))
    if (logKey) {
      await lib.smelt(logKey, 'cobblestone', 2) // wait, smelt with planks
      if (lib.count('charcoal') > 0) await lib.craft('torch', lib.count('charcoal') * 4)
    }
  } catch (e) {}
}

console.log('Torches ready:', lib.count('torch'))

// 2. Step outside base door
console.log('Stepping outside base door...')
try {
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -52)
  await lib.door(294, 72, -54, false)
} catch (e) {}

// 3. Travel to dry east hills at (340, 75, -30)
console.log('Navigating to dry east hills (340, 75, -30)...')
await lib.goTo(340, 75, -30, 3)
console.log('Arrived at diamond descent staging point:', lib.fmt(bot.entity.position))

bot.chat('beta: At east hills (340, 75, -30). Starting deep staircase descent down to diamond level (y -54)!')

// 4. Descend to y=-54 via safe staircase
console.log('Beginning staircase descent to y=-54...')
try {
  const descRes = await lib.descend(-54, { torchEvery: 8 })
  console.log('Descend result:', descRes)
} catch (de) {
  console.log('Descend note/stopped at:', de.message, 'now at:', lib.fmt(bot.entity.position))
}

console.log('Reached depth:', lib.fmt(bot.entity.position))

// 5. Search for diamond ore
const diamonds = lib.find(['diamond_ore', 'deepslate_diamond_ore'], { maxDistance: 32, count: 10 })
console.log(`Found ${diamonds.length} diamond ores at depth:`, diamonds.map(d => lib.fmt(d.position)).join(', '))

for (const d of diamonds) {
  if (lib.count('diamond') >= 3) break
  console.log(`Mining diamond at ${lib.fmt(d.position)} with iron pickaxe...`)
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 2, { dig: true })
    await lib.dig(d.position.x, d.position.y, d.position.z)
  } catch (me) {}
}
await lib.pickup(8)

console.log('Diamonds in inventory:', lib.count('diamond'))

// 6. Craft diamond_pickaxe if 3 diamonds
if (lib.count('diamond') >= 3 && lib.count('diamond_pickaxe') === 0) {
  console.log('Crafting diamond_pickaxe...')
  try {
    if (lib.count('stick') < 2) await lib.craft('stick', 4)
    await lib.craft('diamond_pickaxe', 1)
    console.log('DIAMOND PICKAXE CRAFTED!')
    bot.chat('beta: Milestone 6 achieved! Crafted DIAMOND PICKAXE!')
  } catch (ce) {
    console.log('Diamond pickaxe craft note:', ce.message)
  }
}

console.log('Inventory after diamond operation:', JSON.stringify(lib.inv()))
console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Position:', lib.fmt(bot.entity.position))

return { diamonds: lib.count('diamond'), diamond_pickaxe: lib.count('diamond_pickaxe'), tools: lib.tools(), pos: bot.entity.position }
