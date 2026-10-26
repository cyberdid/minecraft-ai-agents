console.log('=== Ascend to Base & Craft Diamond Pickaxe ===')

bot.chat('beta: Mined 3 diamonds! Climbing back up to base to craft diamond_pickaxe.')

// 1. Ascend back up to base
console.log('Pathfinding up to base (294, 72, -54)...')
await lib.goTo(294, 72, -54, 2, { dig: true, timeoutMs: 75000 })
console.log('Arrived at base entrance:', lib.fmt(bot.entity.position))

// 2. Enter base through door
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Inside base at:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Door entry note:', e.message)
}

// 3. Craft diamond_pickaxe
console.log('Crafting diamond_pickaxe...')
const craftRes = await lib.craft('diamond_pickaxe', 1)
console.log('Craft result:', JSON.stringify(craftRes))

// 4. Verify diamond pickaxe
const dpCount = lib.count('diamond_pickaxe')
console.log('Diamond pickaxe count:', dpCount)

if (dpCount > 0) {
  bot.chat('Milestone 6 COMPLETE: A diamond pickaxe crafted by Beta!')
  await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
}

console.log('Beta tools:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
