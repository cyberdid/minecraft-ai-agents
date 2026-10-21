// Place water against (349, -54, -28) face (1, 0, 0)
const wall = bot.blockAt(new Vec3(349, -54, -28))
console.log('Wall block:', wall?.name)

await bot.equip(mcData.itemsByName.water_bucket.id, 'hand')
await bot.activateBlock(wall, new Vec3(1, 0, 0))
await sleep(3000)

const t1 = bot.blockAt(new Vec3(350, -55, -28))?.name
const t2 = bot.blockAt(new Vec3(351, -55, -27))?.name
console.log('Target 1 is now:', t1)
console.log('Target 2 is now:', t2)

return { t1, t2, waterBucket: lib.count('water_bucket'), bucket: lib.count('bucket') }
