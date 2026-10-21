console.log('Crafting planks from oak_log for extra fuel...')
if (lib.count('oak_log') > 0) {
  await lib.craft('oak_planks', 4)
}

// Check planks in inventory
console.log('Planks on beta:', lib.count('oak_planks') + lib.count('birch_planks'))
if (lib.count('oak_planks') < 8) {
  await lib.withdraw({ oak_planks: 8 })
}

console.log('Starting parallel smelting of 15 raw iron...')
bot.chat('beta: Parallel smelting 15 raw iron in furnace array!')

// Furnace 1 at (295, 72, -55)
const f1 = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -55)))
console.log('Loading Furnace 1 with 8 raw iron and 6 oak planks...')
await f1.putInput(mcData.itemsByName.raw_iron.id, null, 8)
await f1.putFuel(mcData.itemsByName.oak_planks.id, null, 6)
f1.close()

// Furnace 2 at (295, 72, -54)
const f2 = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -54)))
console.log('Loading Furnace 2 with 7 raw iron and 6 oak planks...')
await f2.putInput(mcData.itemsByName.raw_iron.id, null, 7)
await f2.putFuel(mcData.itemsByName.oak_planks.id, null, 6)
f2.close()

// Wait ~65s while checking progress
for (let i = 0; i < 12; i++) {
  await sleep(6000)
  console.log(`Smelting progress tick ${(i+1)*6}s...`)
}

// Collect from Furnace 1
const f1Done = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -55)))
console.log('F1 output:', f1Done.outputItem()?.count)
if (f1Done.outputItem()?.count > 0) await f1Done.takeOutput()
f1Done.close()

// Collect from Furnace 2
const f2Done = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -54)))
console.log('F2 output:', f2Done.outputItem()?.count)
if (f2Done.outputItem()?.count > 0) await f2Done.takeOutput()
f2Done.close()

console.log('Iron ingots in inventory:', lib.count('iron_ingot'))
bot.chat(`beta: Smelted ${lib.count('iron_ingot')} iron ingots! Crafting armor.`)

// Craft armor
if (lib.count('iron_ingot') >= 8) {
  console.log('Crafting iron_chestplate...')
  await lib.craft('iron_chestplate', 1)
}
if (lib.count('iron_ingot') >= 5) {
  console.log('Crafting iron_helmet...')
  await lib.craft('iron_helmet', 1)
}
if (lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots...')
  await lib.craft('iron_boots', 1)
}

// Equip armor
await lib.equipArmor()

console.log('Beta gear now:', JSON.stringify(lib.tools()))
console.log('Beta inventory now:', JSON.stringify(lib.inv()))
return { inventory: lib.inv(), tools: lib.tools() }
