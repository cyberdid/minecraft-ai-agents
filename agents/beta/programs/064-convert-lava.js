// Pour water from water_bucket to convert the 2 lava sources at y=-56 into obsidian
console.log('Targeting wall at (346, -55, -30)...')
await bot.equip(mcData.itemsByName.water_bucket.id, 'hand')
const wall = bot.blockAt(new Vec3(346, -55, -30))
console.log('Wall block:', wall?.name)
await bot.lookAt(new Vec3(346.5, -54.5, -30.0), true)
await sleep(150)
bot.activateItem()
await sleep(2500)

// Check if obsidian formed at (346, -56, -31) and (347, -56, -31)
const bl1 = bot.blockAt(new Vec3(346, -56, -31))?.name
const bl2 = bot.blockAt(new Vec3(347, -56, -31))?.name
console.log('Converted blocks:', bl1, bl2)

// Extinguish water by placing cobblestone at water source
const waterVec = bot.findBlocks({
  matching: b => b && b.name === 'water' && b.metadata === 0,
  maxDistance: 8,
  count: 5
})
console.log('Water source found at:', waterVec)
for (const p of waterVec) {
  console.log('Plugging water source at', p)
  await lib.place('cobblestone', p.x, p.y, p.z).catch(e => console.log('Plug error:', e.message))
}
await sleep(1500)

const remainingWater = bot.findBlocks({
  matching: b => b && (b.name === 'water' || b.name === 'flowing_water'),
  maxDistance: 16,
  count: 10
})
console.log('Remaining water blocks:', remainingWater.length)
return { bl1, bl2, remainingWater: remainingWater.length }
