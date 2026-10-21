// Scoop lava using bot.activateItem() while looking at the lava source
const lavaPos = new Vec3(346, -56, -31)
console.log('Looking at lava center:', lavaPos.offset(0.5, 0.5, 0.5))

await bot.equip(mcData.itemsByName.bucket.id, 'hand')
await bot.lookAt(lavaPos.offset(0.5, 0.5, 0.5), true)
await sleep(150)
bot.activateItem()
await sleep(800)

console.log('Lava bucket count:', lib.count('lava_bucket'))
console.log('Empty bucket count:', lib.count('bucket'))
return { lavaBucket: lib.count('lava_bucket') }
