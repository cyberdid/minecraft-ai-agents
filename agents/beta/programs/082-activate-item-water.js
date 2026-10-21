// Place water using bot.activateItem() looking at (349.9, -54.5, -28.0)
console.log('Equipping water_bucket...')
await bot.equip(mcData.itemsByName.water_bucket.id, 'hand')
await bot.lookAt(new Vec3(349.9, -54.5, -28.0), true)
await sleep(150)
bot.activateItem()
await sleep(2500)

console.log('Water bucket count:', lib.count('water_bucket'))
console.log('Empty bucket count:', lib.count('bucket'))

const t1 = bot.blockAt(new Vec3(350, -55, -28))?.name
const t2 = bot.blockAt(new Vec3(351, -55, -27))?.name
console.log('Target 1 is now:', t1)
console.log('Target 2 is now:', t2)

return { t1, t2, waterBucket: lib.count('water_bucket') }
