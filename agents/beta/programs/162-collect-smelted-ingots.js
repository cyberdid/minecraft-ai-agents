console.log('Checking Furnace 1 at (295, 72, -55)...')
const f1 = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -55)))
console.log('F1 input:', f1.inputItem()?.name, f1.inputItem()?.count)
console.log('F1 fuel:', f1.fuelItem()?.name, f1.fuelItem()?.count)
console.log('F1 output:', f1.outputItem()?.name, f1.outputItem()?.count)
console.log('F1 progress:', f1.progress)

// If fuel is missing, put planks
if (!f1.fuelItem() && f1.inputItem()) {
  console.log('Adding planks to furnace fuel...')
  if (lib.count('oak_planks') > 0) {
    await f1.putFuel(mcData.itemsByName.oak_planks.id, null, Math.min(lib.count('oak_planks'), 10))
  }
}

// Wait and harvest ingots as they finish
while (f1.inputItem()?.count > 0 && !isCancelled()) {
  await sleep(4000)
  if (f1.outputItem()?.count > 0) {
    console.log(`Harvesting ${f1.outputItem().count} ingots...`)
    await f1.takeOutput()
  }
  console.log(`Remaining raw iron: ${f1.inputItem()?.count || 0}`)
}

if (f1.outputItem()?.count > 0) {
  await f1.takeOutput()
}
f1.close()

console.log('Total iron ingots in inventory:', lib.count('iron_ingot'))
bot.chat(`beta: Harvested ${lib.count('iron_ingot')} iron ingots! Crafting armor.`)

// Craft chestplate (8)
if (lib.count('iron_ingot') >= 8) {
  console.log('Crafting iron_chestplate...')
  await lib.craft('iron_chestplate', 1)
}

// Craft helmet (5)
if (lib.count('iron_ingot') >= 5) {
  console.log('Crafting iron_helmet...')
  await lib.craft('iron_helmet', 1)
}

// Craft boots (4)
if (lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots...')
  await lib.craft('iron_boots', 1)
}

// Craft shield (1 iron + 6 planks)
if (lib.count('iron_ingot') >= 1 && (lib.count('oak_planks') + lib.count('birch_planks')) >= 6) {
  console.log('Crafting shield...')
  await lib.craft('shield', 1)
}

// Equip armor
await lib.equipArmor()

console.log('Beta gear:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
return { inv: lib.inv(), tools: lib.tools() }
