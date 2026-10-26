console.log('=== Final Climb to Base & Craft Diamond Pickaxe ===')

bot.chat('beta: At y=45 with 3 diamonds! Climbing final 27 blocks into base now.')

// 1. Climb to surface outside base door
console.log('Digging/towering up to (294, 72, -53)...')
await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 65000 })
console.log('Emerged at surface near base door! Pos:', lib.fmt(bot.entity.position))

// 2. Enter base door
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Door entry note:', e.message)
}

// 3. Move near base crafting table at (295, 72, -56)
try {
  await lib.goNearBlock(295, 72, -56)
  console.log('Near crafting table at:', lib.fmt(bot.entity.position))
} catch (e) {}

// 4. Craft diamond_pickaxe
console.log('Crafting diamond_pickaxe...')
const craftRes = await lib.craft('diamond_pickaxe', 1)
console.log('Craft result:', JSON.stringify(craftRes))

const dpCount = lib.count('diamond_pickaxe')
console.log('Diamond pickaxe count:', dpCount)

if (dpCount > 0) {
  bot.chat('Milestone 6 COMPLETE: A diamond pickaxe crafted by Beta!')
  await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
}

// 5. Ensure base door is closed for the night
try {
  await lib.door(294, 72, -54, false)
} catch (e) {}

console.log('Final Gear:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
