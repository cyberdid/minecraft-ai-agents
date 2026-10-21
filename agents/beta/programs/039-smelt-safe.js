// 039-smelt-safe.js - custom robust furnace smelting for 14 raw_iron
console.log('Opening furnace at (295, 72, -55)...')
const furnaceBlock = lib.blockAt(295, 72, -55)
await lib.goNearBlock(295, 72, -55)
const furnace = await bot.openFurnace(furnaceBlock)

console.log('Furnace slots:')
for (let i = 0; i < 3; i++) {
  const item = furnace.slots[i]
  console.log(`Slot ${i}:`, item ? `${item.count}x ${item.name}` : 'empty')
}

// Find raw_iron in inventory slots (slots 3..38)
const rawItem = furnace.slots.slice(3).find(i => i && i.name === 'raw_iron')
console.log('raw_iron in window slot:', rawItem?.slot, rawItem?.count)

if (rawItem) {
  // Pick up raw_iron
  await bot.clickWindow(rawItem.slot, 0, 0)
  // Put into slot 0 (furnace input)
  await bot.clickWindow(0, 0, 0)
  // Stow cursor if any remaining
  await lib.stowCursor()
  console.log('Placed raw_iron into furnace input!')
}

// Ensure fuel in slot 1: check if furnace is burning or has fuel
console.log('Fuel slot:', furnace.slots[1]?.name, furnace.slots[1]?.count)
if (!furnace.slots[1]) {
  const fuelItem = furnace.slots.slice(3).find(i => i && (i.name.endsWith('_planks') || i.name.endsWith('_log')))
  if (fuelItem) {
    await bot.clickWindow(fuelItem.slot, 0, 0)
    await bot.clickWindow(1, 0, 0)
    await lib.stowCursor()
    console.log('Placed fuel into furnace slot 1!')
  }
}

// Wait and harvest output ingots
let smelted = 0
const deadline = Date.now() + 150000 // up to 150s
console.log('Waiting for smelting...')

while (Date.now() < deadline && !isCancelled()) {
  await sleep(1500)
  const out = furnace.outputItem()
  if (out && out.count > 0) {
    console.log(`Harvesting ${out.count}x ${out.name}...`)
    smelted += out.count
    await furnace.takeOutput()
    console.log(`Total smelted so far: ${smelted}`)
    // If input is empty and output taken, we're done!
    if (!furnace.inputItem()) break
  }
  // Check if out of fuel while input remains
  if (!furnace.fuelItem() && furnace.inputItem()) {
    const moreFuel = furnace.slots.slice(3).find(i => i && (i.name.endsWith('_planks') || i.name.endsWith('_log')))
    if (moreFuel) {
      await bot.clickWindow(moreFuel.slot, 0, 0)
      await bot.clickWindow(1, 0, 0)
      await lib.stowCursor()
    }
  }
}

furnace.close()
console.log(`Smelting session ended. Total ingots gained: ${smelted}`)
console.log('Inventory now:', JSON.stringify(lib.inv()))

// Craft iron pickaxe, sword, axe, shield, bucket
if (lib.count('iron_ingot') >= 3 && lib.count('iron_pickaxe') === 0) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4)
  await lib.craft('iron_pickaxe', 1)
  console.log('Iron pickaxe crafted!')
}
if (lib.count('iron_ingot') >= 2 && lib.count('iron_sword') === 0) {
  if (lib.count('stick') < 1) await lib.craft('stick', 4)
  await lib.craft('iron_sword', 1)
  console.log('Iron sword crafted!')
}
if (lib.count('iron_ingot') >= 3 && lib.count('iron_axe') === 0) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4)
  await lib.craft('iron_axe', 1)
  console.log('Iron axe crafted!')
}
if (lib.count('iron_ingot') >= 1 && lib.count('shield') === 0) {
  if (lib.count('*_planks') < 6) await lib.craft('birch_planks', 4)
  try {
    await lib.craft('shield', 1)
    await lib.equipArmor()
    console.log('Shield crafted and equipped!')
  } catch (e) {}
}
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0) {
  try {
    await lib.craft('bucket', 1)
    console.log('Bucket crafted!')
  } catch (e) {}
}

console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Inventory after craft:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

bot.chat(`beta: Smelted iron! Gear: ${JSON.stringify(lib.tools())}`)
return lib.inv()
