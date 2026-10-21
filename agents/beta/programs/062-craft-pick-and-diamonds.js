// programs/062-craft-pick-and-diamonds.js
// 1. Mine remaining deepslate iron ore to get >= 3 raw_iron
// 2. Craft & place crafting table and furnace locally
// 3. Smelt 3 iron ingots using birch planks as fuel
// 4. Craft fresh iron_pickaxe
// 5. Mine deepslate diamond ores using iron_pickaxe
// 6. Craft diamond_pickaxe (Milestone 6)

console.log('Starting Milestone 6: Iron Pickaxe -> Diamonds -> Diamond Pickaxe')
console.log('Current position:', lib.fmt(bot.entity.position))
console.log('Current inventory:', JSON.stringify(lib.inv()))

// Step 1: Planks from log if needed
if (lib.count('birch_log') > 0 && lib.count('birch_planks') < 8) {
  console.log('Crafting birch planks from log...')
  await lib.craft('birch_planks', 4)
}

// Step 2: Mine deepslate iron ore until raw_iron >= 3
console.log('Raw iron before mining:', lib.count('raw_iron'))
while (!isCancelled() && lib.count('raw_iron') < 3) {
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 16, count: 5 })
  if (ores.length === 0) {
    console.log('No reachable iron ore nearby!')
    break
  }
  const target = ores[0]
  console.log(`Approaching & mining iron ore at ${lib.fmt(target.position)}...`)
  await lib.goTo(target.position.x, target.position.y, target.position.z, 2, { dig: true })
  await lib.dig(target.position.x, target.position.y, target.position.z)
  await lib.pickup(6)
}
console.log('Raw iron in inventory now:', lib.count('raw_iron'))
if (lib.count('raw_iron') < 3) {
  throw new Error(`Insufficient raw iron: have ${lib.count('raw_iron')}, need 3`)
}

// Step 3: Craft crafting_table if none in inv and none placed
if (lib.count('crafting_table') === 0 && lib.find('crafting_table', { maxDistance: 6 }).length === 0) {
  console.log('Crafting crafting_table...')
  await lib.craft('crafting_table', 1)
}

// Ensure table is placed
console.log('Ensuring crafting table placed nearby...')
await lib.ensureTable()

// Step 4: Craft furnace if none in inv and none placed
if (lib.count('furnace') === 0 && lib.find('furnace', { maxDistance: 6 }).length === 0) {
  console.log('Crafting furnace...')
  await lib.craft('furnace', 1)
}

// Ensure furnace placed
let nearbyFurnace = lib.find('furnace', { maxDistance: 6 })[0]
if (!nearbyFurnace) {
  console.log('Placing furnace in free spot...')
  const spot = await lib.freeSpot()
  await lib.place('furnace', spot.x, spot.y, spot.z)
  nearbyFurnace = lib.blockAt(spot.x, spot.y, spot.z)
}
console.log('Furnace ready at:', lib.fmt(nearbyFurnace.position))

// Step 5: Smelt 3 raw iron into iron ingots
console.log('Opening furnace to smelt 3 raw iron...')
const furnace = await bot.openFurnace(nearbyFurnace)

// Put raw_iron into slot 0 (input)
const rawItem = furnace.slots.slice(3).find(i => i && i.name === 'raw_iron')
if (rawItem) {
  console.log(`Putting ${rawItem.count}x raw_iron into input slot...`)
  await bot.clickWindow(rawItem.slot, 0, 0)
  await bot.clickWindow(0, 0, 0)
  await lib.stowCursor()
}

// Put planks into slot 1 (fuel)
const fuelItem = furnace.slots.slice(3).find(i => i && (i.name.endsWith('_planks') || i.name.endsWith('_log')))
if (fuelItem) {
  console.log(`Putting fuel (${fuelItem.name}) into fuel slot...`)
  await bot.clickWindow(fuelItem.slot, 0, 0)
  await bot.clickWindow(1, 0, 0)
  await lib.stowCursor()
}

console.log('Smelting iron ingots in progress...')
const smeltDeadline = Date.now() + 60000 // 60s max
while (Date.now() < smeltDeadline && !isCancelled()) {
  await sleep(1500)
  const out = furnace.outputItem()
  if (out && out.name === 'iron_ingot' && out.count > 0) {
    console.log(`Taking ${out.count} iron ingot(s)...`)
    await furnace.takeOutput()
    if (lib.count('iron_ingot') >= 3) {
      console.log('Acquired 3 iron ingots!')
      break
    }
  }
}
furnace.close()
console.log('Iron ingots in inventory:', lib.count('iron_ingot'))

if (lib.count('iron_ingot') < 3) {
  throw new Error(`Failed to smelt 3 ingots: have ${lib.count('iron_ingot')}`)
}

// Step 6: Craft iron_pickaxe
if (lib.count('stick') < 2) {
  await lib.craft('stick', 4)
}
console.log('Crafting iron_pickaxe...')
await lib.craft('iron_pickaxe', 1)
console.log('Iron pickaxe count:', lib.count('iron_pickaxe'))
if (lib.count('iron_pickaxe') === 0) {
  throw new Error('Failed to craft iron_pickaxe')
}

// Step 7: Mine diamond ores with the iron pickaxe!
console.log('Mining diamond ores...')
while (!isCancelled() && lib.count('diamond') < 5) {
  const diamonds = lib.find(['diamond_ore', 'deepslate_diamond_ore'], { maxDistance: 16, count: 5 })
  if (diamonds.length === 0) {
    console.log('No more reachable diamond ores nearby.')
    break
  }
  const target = diamonds[0]
  console.log(`Found diamond ore at ${lib.fmt(target.position)}, equipping iron_pickaxe...`)
  
  await lib.goTo(target.position.x, target.position.y, target.position.z, 2, { dig: true })
  
  // Ensure iron_pickaxe is in hand right before digging diamond ore
  const ironPick = bot.inventory.items().find(i => i.name === 'iron_pickaxe')
  if (ironPick) {
    await bot.equip(ironPick, 'hand')
  }
  
  await lib.dig(target.position.x, target.position.y, target.position.z)
  await lib.pickup(6)
  console.log('Current diamonds in inventory:', lib.count('diamond'))
}

const totalDiamonds = lib.count('diamond')
console.log('Total diamonds collected:', totalDiamonds)
bot.chat(`beta: Mined ${totalDiamonds} diamonds!`)

// Step 8: Craft diamond_pickaxe (Milestone 6)
if (totalDiamonds >= 3) {
  if (lib.count('stick') < 2) {
    await lib.craft('stick', 4)
  }
  console.log('Crafting DIAMOND_PICKAXE...')
  await lib.craft('diamond_pickaxe', 1)
  console.log('DIAMOND_PICKAXE CRAFTED SUCCESSFULLY!')
  bot.chat('beta: Milestone 6 achieved! DIAMOND PICKAXE crafted!')
} else {
  console.log('Warning: need 3 diamonds to craft diamond pickaxe, have', totalDiamonds)
}

console.log('Final inventory:', JSON.stringify(lib.inv()))
console.log('Tools:', JSON.stringify(lib.tools()))

return {
  diamonds: lib.count('diamond'),
  diamond_pickaxe: lib.count('diamond_pickaxe'),
  iron_pickaxe: lib.count('iron_pickaxe'),
  tools: lib.tools()
}
