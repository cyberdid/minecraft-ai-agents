// Scoop the water source block at (350, -52, -30)
const waterPos = new Vec3(350, -52, -30)
const waterBlock = bot.blockAt(waterPos)
console.log('Target block:', waterBlock?.name, 'metadata:', waterBlock?.metadata)

await bot.equip(mcData.itemsByName.bucket.id, 'hand')
await bot.lookAt(waterPos.offset(0.5, 0.5, 0.5), true)
await bot.activateBlock(waterBlock)
await sleep(1000)

console.log('Water bucket count:', lib.count('water_bucket'))
console.log('Empty bucket count:', lib.count('bucket'))
const remainingWater = bot.findBlocks({ matching: b => b && (b.name === 'water' || b.name === 'flowing_water'), maxDistance: 16, count: 10 })
console.log('Remaining water blocks:', remainingWater.length)
return { waterBucket: lib.count('water_bucket'), remainingWater: remainingWater.length }
