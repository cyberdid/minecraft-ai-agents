console.log('=== Enter Base, Smelt Iron, Craft Boots ===')

// 1. Enter base
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Inside base at:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Door entry note:', e.message)
}

// 2. Craft oak planks for fuel
if (lib.count('oak_log') > 0) {
  console.log('Crafting oak_planks from log...')
  await lib.craft('oak_planks', 4)
}

// 3. Furnace operation
const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock) {
  const f = await bot.openFurnace(fBlock)
  
  // Take cooked beef if present
  if (f.outputItem()?.name === 'cooked_beef') {
    console.log(`Taking ${f.outputItem().count} cooked_beef...`)
    await f.takeOutput()
  }
  
  // Put fuel
  if (lib.count('oak_planks') > 0) {
    console.log('Adding oak_planks as fuel...')
    await f.putFuel(mcData.itemsByName.oak_planks.id, null, Math.min(lib.count('oak_planks'), 4))
  }
  
  // Put raw_iron in input
  if (lib.count('raw_iron') > 0) {
    console.log(`Putting ${Math.min(lib.count('raw_iron'), 6)} raw_iron in furnace...`)
    await f.putInput(mcData.itemsByName.raw_iron.id, null, Math.min(lib.count('raw_iron'), 6))
  }
  
  f.close()
}

// 4. Eat cooked beef if we have any
if (lib.count('cooked_beef') > 0 && bot.food < 20) {
  try {
    await bot.equip(mcData.itemsByName.cooked_beef.id, 'hand')
    await bot.consume()
  } catch (e) {}
}

// 5. Wait for iron ingots to smelt
console.log('Waiting for iron ingots to smelt...')
while (lib.count('iron_ingot') < 4 && !isCancelled()) {
  await sleep(3000)
  try {
    const f = await bot.openFurnace(fBlock)
    if (f.outputItem()?.name === 'iron_ingot') {
      console.log(`Taking ${f.outputItem().count} iron_ingot...`)
      await f.takeOutput()
    }
    f.close()
  } catch (e) {}
  console.log(`Iron ingots on beta: ${lib.count('iron_ingot')}`)
}

// 6. Craft iron boots and equip!
if (lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots...')
  await lib.craft('iron_boots', 1)
  console.log('Equipping armor...')
  await lib.equipArmor()
  bot.chat('Milestone 3 update: Beta crafted and equipped iron_boots! Full iron armor equipped!')
}

console.log('Final Gear:', JSON.stringify(lib.tools()))
console.log('Armor worn:', bot.inventory.slots.filter(s => s && s.name.includes('iron_')).map(s => s.name))
console.log('Beta inv:', JSON.stringify(lib.inv()))
