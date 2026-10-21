console.log('Equipping water bucket...')
await bot.equip(mcData.itemsByName.water_bucket.id, 'hand')

// Look at the top of cobblestone at (350, -55, -29)
console.log('Placing water on top of (350, -55, -29)...')
await bot.lookAt(new Vec3(350.5, -54.9, -29.5), true)
await sleep(200)
bot.activateItem()
await sleep(3000)

const target = bot.blockAt(new Vec3(351, -55, -27))?.name
console.log('Block at (351, -55, -27) is now:', target)

// Find where the water source was placed
const waterSource = bot.findBlocks({
  matching: b => b.name === 'water' && b.metadata === 0,
  maxDistance: 4,
  count: 1
})[0]

if (waterSource) {
  console.log('Found water source at:', waterSource)
  await bot.equip(mcData.itemsByName.bucket.id, 'hand')
  await bot.lookAt(waterSource.offset(0.5, 0.5, 0.5), true)
  await sleep(200)
  bot.activateItem()
  await sleep(1000)
  console.log('Water bucket count after scoop:', lib.count('water_bucket'))
} else {
  console.log('Warning: water source not found within 4 blocks!')
}

await sleep(1500)
console.log('Final target block at (351, -55, -27):', bot.blockAt(new Vec3(351, -55, -27))?.name)
