// Convert both safe lava blocks to obsidian, scoop water, and mine them
console.log('Obsidian before:', lib.count('obsidian'))

// 1. Dig deepslate above (350, -55, -28)
console.log('Digging block above first lava at (350, -54, -28)...')
await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
await lib.dig(350, -54, -28)

// 2. Pour water next to it at (349, -54, -28)
console.log('Pouring water from water_bucket...')
await bot.equip(mcData.itemsByName.water_bucket.id, 'hand')
await bot.lookAt(new Vec3(349.5, -54.8, -28.5), true)
await sleep(150)
bot.activateItem()
await sleep(2500)
console.log('Block at (350, -55, -28) is now:', bot.blockAt(new Vec3(350, -55, -28))?.name)

// 3. Dig deepslate above second lava at (351, -54, -27)
console.log('Digging block above second lava at (351, -54, -27)...')
await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
await lib.dig(351, -54, -27)
await sleep(2500)
console.log('Block at (351, -55, -27) is now:', bot.blockAt(new Vec3(351, -55, -27))?.name)

// 4. Scoop water source back into bucket
console.log('Scooping water back...')
await bot.equip(mcData.itemsByName.bucket.id, 'hand')
await bot.lookAt(new Vec3(349.5, -54.2, -28.5), true)
await sleep(150)
bot.activateItem()
await sleep(800)
console.log('Water bucket count:', lib.count('water_bucket'))

if (lib.count('water_bucket') === 0) {
  console.log('Plugging water source with cobblestone...')
  await lib.place('cobblestone', 349, -54, -28).catch(e => console.log('Plug error:', e.message))
  await sleep(1000)
}

// 5. Mine both obsidian blocks on dry ground!
console.log('Mining first obsidian at (350, -55, -28)...')
await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
await lib.dig(350, -55, -28)
await lib.pickup(4)
console.log('Obsidian in inventory:', lib.count('obsidian'))

console.log('Mining second obsidian at (351, -55, -27)...')
await lib.dig(351, -55, -27)
await lib.pickup(4)
console.log('FINAL obsidian in inventory:', lib.count('obsidian'))

return { obsidian: lib.count('obsidian'), waterBucket: lib.count('water_bucket') }
