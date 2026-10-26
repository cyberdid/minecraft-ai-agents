console.log('=== Tower Straight Up to Surface & Craft Diamond Pickaxe ===')

// 1. Tower up to y=72
while (bot.entity.position.y < 71.5 && !isCancelled()) {
  const curY = Math.floor(bot.entity.position.y)
  const p = bot.entity.position.floored()
  
  // Clear blocks above head (y+1 and y+2)
  for (let dy = 1; dy <= 2; dy++) {
    const target = new Vec3(p.x, curY + dy, p.z)
    const b = bot.blockAt(target)
    if (b && b.boundingBox === 'block') {
      await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand')
      await lib.dig(target.x, target.y, target.z)
    }
  }
  
  // Jump and place cobblestone under feet
  await bot.equip(mcData.itemsByName.cobblestone.id, 'hand')
  bot.setControlState('jump', true)
  await sleep(250)
  try {
    const under = new Vec3(p.x, curY, p.z)
    await bot.placeBlock(bot.blockAt(under), new Vec3(0, 1, 0))
  } catch (e) {}
  bot.setControlState('jump', false)
  await sleep(150)
}

console.log('Emerged at surface! Pos:', lib.fmt(bot.entity.position))

// 2. Walk to base door
await lib.goTo(294, 72, -53, 1, { timeoutMs: 20000 })
console.log('At base door:', lib.fmt(bot.entity.position))

// 3. Enter base door
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Inside base at:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Door entry note:', e.message)
}

// 4. Stand near crafting table at (295, 72, -56)
try {
  await lib.goNearBlock(295, 72, -56)
} catch (e) {}

// 5. Craft diamond_pickaxe
console.log('Crafting diamond_pickaxe...')
const res = await lib.craft('diamond_pickaxe', 1)
console.log('Craft result:', JSON.stringify(res))

const dpCount = lib.count('diamond_pickaxe')
console.log('Diamond pickaxe count:', dpCount)

if (dpCount > 0) {
  bot.chat('Milestone 6 COMPLETE: A diamond pickaxe crafted by Beta!')
  await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
}

// Ensure door is closed
try {
  await lib.door(294, 72, -54, false)
} catch (e) {}

console.log('Final tools:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
