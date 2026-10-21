// Scoop lava source block at (346, -56, -31)
const lavaPos = new Vec3(346, -56, -31)
const lavaBlock = bot.blockAt(lavaPos)
console.log('Targeting:', lavaPos, 'name:', lavaBlock?.name, 'meta:', lavaBlock?.metadata)

await bot.equip(mcData.itemsByName.bucket.id, 'hand')
await bot.lookAt(lavaPos.offset(0.5, 0.8, 0.5), true)
await bot.activateBlock(lavaBlock)
await sleep(600)

console.log('Lava bucket count:', lib.count('lava_bucket'))
console.log('Empty bucket count:', lib.count('bucket'))
return { lavaBucket: lib.count('lava_bucket') }
