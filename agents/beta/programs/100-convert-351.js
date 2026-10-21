console.log('Equipping water bucket...')
await bot.equip(mcData.itemsByName.water_bucket.id, 'hand')

// Look at the deepslate wall at (350, -54, -27)
await bot.lookAt(new Vec3(350.5, -54.5, -27.0), true)
await sleep(200)
bot.activateItem()
await sleep(1500)

console.log('Block at (351, -55, -27) is now:', bot.blockAt(new Vec3(351, -55, -27))?.name)
console.log('Block at (351, -54, -27) is now:', bot.blockAt(new Vec3(351, -54, -27))?.name)

// Now scoop the water source back into the bucket
await bot.equip(mcData.itemsByName.bucket.id, 'hand')
await bot.lookAt(new Vec3(351.5, -53.8, -26.8), true)
await sleep(200)
bot.activateItem()
await sleep(1000)

console.log('After scoop: block at (351, -54, -27):', bot.blockAt(new Vec3(351, -54, -27))?.name)
console.log('After scoop: block at (351, -55, -27):', bot.blockAt(new Vec3(351, -55, -27))?.name)
console.log('Water bucket count:', lib.count('water_bucket'))
