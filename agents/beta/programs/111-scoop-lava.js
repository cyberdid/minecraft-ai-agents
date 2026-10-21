console.log('Equipping diamond pickaxe...')
await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')

// 1. Dig deepslate at (350, -54, -27)
const bWall = bot.blockAt(new Vec3(350, -54, -27))
if (bWall && bWall.name !== 'air') {
  console.log('Digging wall at (350, -54, -27)...')
  await lib.dig(350, -54, -27)
  await sleep(500)
}

// Check line of sight to (351, -55, -27)
const target = bot.blockAt(new Vec3(351, -55, -27))
console.log('Target lava block:', target ? target.name : 'null', target ? target.metadata : '')

// 2. Equip empty bucket
await bot.equip(mcData.itemsByName.bucket.id, 'hand')
console.log('Empty buckets in inventory:', lib.count('bucket'))

// 3. Look at (351, -55, -27) lava source and activateItem
console.log('Scooping lava...')
await bot.lookAt(new Vec3(351.5, -54.7, -27.5), true)
await sleep(200)
bot.activateItem()
await sleep(1000)

console.log('Lava bucket count:', lib.count('lava_bucket'))
console.log('Target block after scoop:', bot.blockAt(new Vec3(351, -55, -27))?.name)
