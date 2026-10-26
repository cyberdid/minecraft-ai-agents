console.log('=== Hunt Cows for Food & Refuel ===')

// 1. Hunt 2 cows
console.log('Hunting cows for beef...')
try {
  await lib.equipWeapon()
  const h = await lib.hunt('cow', 2)
  console.log('Hunt result:', JSON.stringify(h))
} catch (e) {
  console.log('Hunt error:', e.message)
}

// 2. Return into base to cook in Furnace 1
console.log('Returning to base...')
await lib.goTo(294, 72, -53, 1, { timeoutMs: 25000 })
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {}

// Cook beef in furnace
const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock && lib.count('beef') > 0) {
  try {
    const f = await bot.openFurnace(fBlock)
    // Check fuel
    if (!f.fuelItem()) {
      // Put a stick or planks or craft planks from birch log in chest
      if (lib.count('stick') > 0) {
        await f.putFuel(mcData.itemsByName.stick.id, null, Math.min(lib.count('stick'), 4))
      }
    }
    await f.putInput(mcData.itemsByName.beef.id, null, lib.count('beef'))
    f.close()
    
    // Wait for cooking
    console.log('Waiting for beef to cook...')
    await sleep(15000)
    
    const f2 = await bot.openFurnace(fBlock)
    if (f2.outputItem()) {
      await f2.takeOutput()
    }
    f2.close()
  } catch (e) {
    console.log('Cooking note:', e.message)
  }
}

// Eat food
while (bot.food < 18 && (lib.count('cooked_beef') > 0 || lib.count('beef') > 0) && !isCancelled()) {
  try {
    const foodItem = lib.count('cooked_beef') > 0 ? 'cooked_beef' : 'beef'
    await bot.equip(mcData.itemsByName[foodItem].id, 'hand')
    await bot.consume()
  } catch (e) { break }
}

console.log('Food now:', bot.food, 'Health:', bot.health)
console.log('Beta inv:', JSON.stringify(lib.inv()))
bot.chat(`beta: Refueled! Food: ${bot.food}/20, Health: ${bot.health}/20. Ready for 10 obsidian.`)
