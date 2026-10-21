// Cast and mine obsidian block 9
console.log('Moving to (348, -54, -30)...')
await lib.goTo(348, -54, -30, 1)

// 1. Place lava at (348, -55, -31)
console.log('Placing lava...')
await bot.equip(mcData.itemsByName.lava_bucket.id, 'hand')
const floorBlock = bot.blockAt(new Vec3(348, -56, -31))
await bot.activateBlock(floorBlock, new Vec3(0, 1, 0))
await sleep(600)
console.log('Block at (348, -55, -31):', bot.blockAt(new Vec3(348, -55, -31))?.name)

// 2. Place water next to it at (348, -54, -30)
console.log('Pouring water...')
await bot.equip(mcData.itemsByName.water_bucket.id, 'hand')
const waterFloor = bot.blockAt(new Vec3(348, -55, -30))
await bot.activateBlock(waterFloor, new Vec3(0, 1, 0))
await sleep(1500)
console.log('Obsidian check:', bot.blockAt(new Vec3(348, -55, -31))?.name)

// 3. Scoop water back
console.log('Scooping water...')
const waterPos = new Vec3(348, -54, -30)
await bot.equip(mcData.itemsByName.bucket.id, 'hand')
await bot.lookAt(waterPos.offset(0.5, 0.5, 0.5), true)
await sleep(150)
bot.activateItem()
await sleep(800)
console.log('Water bucket count:', lib.count('water_bucket'))

// If water didn't scoop, extinguish source with cobblestone
if (lib.count('water_bucket') === 0) {
  console.log('Plugging water source with cobblestone...')
  await lib.place('cobblestone', waterPos.x, waterPos.y, waterPos.z).catch(() => {})
  await sleep(1000)
}

// 4. Mine obsidian
console.log('Mining obsidian...')
await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
await lib.dig(348, -55, -31)
await lib.pickup(4)
console.log('Obsidian count now:', lib.count('obsidian'))
return { obsidian: lib.count('obsidian'), waterBucket: lib.count('water_bucket') }
