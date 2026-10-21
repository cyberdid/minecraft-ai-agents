// Dig the divider at (350, -55, -29) so water flows into lava at (350, -55, -28)
console.log('Digging divider at (350, -55, -29)...')
await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
await lib.dig(350, -55, -29)
await sleep(2000)

const target1 = bot.blockAt(new Vec3(350, -55, -28))?.name
console.log('Target 1 is now:', target1)

// Also check divider between (350, -55, -28) and (351, -55, -27)
const div2 = bot.blockAt(new Vec3(350, -55, -27))?.name
console.log('Divider 2 at (350, -55, -27) is:', div2)
if (div2 === 'deepslate' || div2 === 'cobblestone') {
  console.log('Digging divider 2 at (350, -55, -27)...')
  await lib.dig(350, -55, -27)
  await sleep(2000)
}
const target2 = bot.blockAt(new Vec3(351, -55, -27))?.name
console.log('Target 2 is now:', target2)

// Scoop the water source back into the bucket at (349, -55, -29)
console.log('Scooping water...')
await bot.equip(mcData.itemsByName.bucket.id, 'hand')
await bot.lookAt(new Vec3(349.5, -54.8, -28.8), true)
await sleep(150)
bot.activateItem()
await sleep(800)
console.log('Water bucket count:', lib.count('water_bucket'))

// Mine target 1
if (target1 === 'obsidian' || bot.blockAt(new Vec3(350, -55, -28))?.name === 'obsidian') {
  console.log('Mining obsidian 1...')
  await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
  await lib.dig(350, -55, -28)
  await lib.pickup(4)
}

// Mine target 2
if (target2 === 'obsidian' || bot.blockAt(new Vec3(351, -55, -27))?.name === 'obsidian') {
  console.log('Mining obsidian 2...')
  await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
  await lib.dig(351, -55, -27)
  await lib.pickup(4)
}

console.log('FINAL OBSIDIAN COUNT:', lib.count('obsidian'))
return { obsidian: lib.count('obsidian'), waterBucket: lib.count('water_bucket') }
