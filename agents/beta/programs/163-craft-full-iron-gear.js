console.log('Collecting all smelted iron ingots...')
const f1 = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -55)))
if (f1.outputItem()?.count > 0) {
  console.log(`Taking ${f1.outputItem().count} ingots from F1...`)
  await f1.takeOutput()
}
f1.close()

const f2 = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -54)))
if (f2.outputItem()?.count > 0) {
  console.log(`Taking ${f2.outputItem().count} ingots from F2...`)
  await f2.takeOutput()
}
f2.close()

console.log('Iron ingots in inventory:', lib.count('iron_ingot'))
bot.chat(`beta: ${lib.count('iron_ingot')} iron ingots ready! Crafting full iron gear.`)

// Craft chestplate (8)
if (lib.count('iron_ingot') >= 8 && lib.count('iron_chestplate') === 0) {
  console.log('Crafting iron_chestplate...')
  await lib.craft('iron_chestplate', 1)
}

// Craft helmet (5)
if (lib.count('iron_ingot') >= 5 && lib.count('iron_helmet') === 0) {
  console.log('Crafting iron_helmet...')
  await lib.craft('iron_helmet', 1)
}

// Craft boots (4)
if (lib.count('iron_ingot') >= 4 && lib.count('iron_boots') === 0) {
  console.log('Crafting iron_boots...')
  await lib.craft('iron_boots', 1)
}

// Craft bucket (3)
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0) {
  console.log('Crafting bucket...')
  await lib.craft('bucket', 1)
}

// Craft shield (1 iron + 6 planks)
if (lib.count('iron_ingot') >= 1 && (lib.count('oak_planks') + lib.count('birch_planks')) >= 6 && lib.count('shield') === 0) {
  console.log('Crafting shield...')
  await lib.craft('shield', 1)
}

// Equip armor
console.log('Equipping all armor and shield...')
await lib.equipArmor()
await lib.equipWeapon()

console.log('FINAL GEAR:', JSON.stringify(lib.tools()))
console.log('FINAL INVENTORY:', JSON.stringify(lib.inv()))
return { gear: lib.tools(), inv: lib.inv() }
