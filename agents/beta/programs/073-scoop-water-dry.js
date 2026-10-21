// Scoop water source at (349, -55, -30)
console.log('Equipping bucket...')
await bot.equip(mcData.itemsByName.bucket.id, 'hand')
await bot.lookAt(new Vec3(349.5, -54.8, -29.8), true)
await sleep(150)
bot.activateItem()
await sleep(800)

console.log('Water bucket count:', lib.count('water_bucket'))
console.log('Empty bucket count:', lib.count('bucket'))
const water = bot.findBlocks({ matching: b => b && (b.name === 'water' || b.name === 'flowing_water'), maxDistance: 8, count: 5 })
console.log('Remaining water:', water.length)
return { waterBucket: lib.count('water_bucket'), remainingWater: water.length }
