// Place lava from bucket into (348, -55, -31)
console.log('Equipping lava bucket...')
await bot.equip(mcData.itemsByName.lava_bucket.id, 'hand')
console.log('Looking at floor of target pocket...')
await bot.lookAt(new Vec3(348.5, -55.8, -31.5), true)
await sleep(150)
bot.activateItem()
await sleep(800)

console.log('Target block at (348, -55, -31):', bot.blockAt(new Vec3(348, -55, -31))?.name)
console.log('Lava bucket count:', lib.count('lava_bucket'))
console.log('Empty bucket count:', lib.count('bucket'))
return { targetBlock: bot.blockAt(new Vec3(348, -55, -31))?.name, bucketCount: lib.count('bucket') }
