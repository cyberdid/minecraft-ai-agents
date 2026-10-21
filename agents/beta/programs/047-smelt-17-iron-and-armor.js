// 047-smelt-17-iron-and-armor.js - add fuel to furnace, harvest 17 iron ingots, craft iron chestplate & leggings
console.log('Crafting birch planks for fuel...')
if (lib.count('birch_log') > 0) {
  await lib.craft('birch_planks', lib.count('birch_log') * 4)
}

const furnaceBlock = lib.blockAt(295, 72, -55)
const furnace = await bot.openFurnace(furnaceBlock)

// Add fuel to slot 1
const fuelItem = furnace.slots.slice(3).find(i => i && i.name.endsWith('_planks'))
if (fuelItem) {
  console.log(`Adding ${fuelItem.count}x fuel into slot 1...`)
  await bot.clickWindow(fuelItem.slot, 0, 0)
  await bot.clickWindow(1, 0, 0)
  await lib.stowCursor()
}

// Harvest iron ingots in a loop
console.log('Harvesting iron ingots as they smelt...')
let totalHarvested = 0
const deadline = Date.now() + 150000 // 150s

while (Date.now() < deadline && !isCancelled()) {
  await sleep(1500)
  const out = furnace.outputItem()
  if (out && out.name === 'iron_ingot' && out.count > 0) {
    totalHarvested += out.count
    console.log(`Harvested ${out.count} ingots (total: ${totalHarvested})...`)
    await furnace.takeOutput()
    
    // If we have enough for chestplate (8) + leggings (7) = 15 ingots, or input finished
    if (totalHarvested >= 15 || !furnace.inputItem()) {
      break
    }
  }
}

furnace.close()
console.log(`Finished smelting run. Iron ingots in inventory: ${lib.count('iron_ingot')}`)

// Craft iron armor
const ingots = lib.count('iron_ingot')

// 1. iron_chestplate (8 ingots)
if (ingots >= 8 && lib.count('iron_chestplate') === 0) {
  console.log('Crafting iron_chestplate...')
  try {
    await lib.craft('iron_chestplate', 1)
    console.log('Iron chestplate crafted!')
  } catch (e) {
    console.log('Chestplate error:', e.message)
  }
}

// 2. iron_leggings (7 ingots)
if (lib.count('iron_ingot') >= 7 && lib.count('iron_leggings') === 0) {
  console.log('Crafting iron_leggings...')
  try {
    await lib.craft('iron_leggings', 1)
    console.log('Iron leggings crafted!')
  } catch (e) {
    console.log('Leggings error:', e.message)
  }
}

// 3. iron_helmet (5 ingots)
if (lib.count('iron_ingot') >= 5 && lib.count('iron_helmet') === 0) {
  console.log('Crafting iron_helmet...')
  try {
    await lib.craft('iron_helmet', 1)
    console.log('Iron helmet crafted!')
  } catch (e) {
    console.log('Helmet error:', e.message)
  }
}

// Equip armor
const worn = await lib.equipArmor()
console.log('Currently worn armor:', JSON.stringify(worn))
console.log('Time left in day:', lib.time().secondsUntilNight)

bot.chat(`beta: Milestone 3 progress! Worn armor: ${JSON.stringify(worn)}`)
return { worn, inv: lib.inv(), time: lib.time() }
