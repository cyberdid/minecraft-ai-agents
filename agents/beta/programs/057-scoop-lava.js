// Scoop 1 lava source block into empty bucket
const lavaPos = new Vec3(344, -55, -31)
const lavaBlock = bot.blockAt(lavaPos)
console.log('Targeting lava at', lavaPos, 'name:', lavaBlock?.name, 'meta:', lavaBlock?.metadata)

await bot.equip(mcData.itemsByName.bucket.id, 'hand')
await bot.lookAt(lavaPos.offset(0.5, 0.8, 0.5), true)
await bot.activateBlock(lavaBlock)
await sleep(600)

console.log('Lava bucket count:', lib.count('lava_bucket'))
console.log('Empty bucket count:', lib.count('bucket'))
console.log('Water bucket count:', lib.count('water_bucket'))
return { lavaBucket: lib.count('lava_bucket') }
