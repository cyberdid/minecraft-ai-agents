console.log('Starting obsidian quench and mine...')
console.log('Initial obsidian:', lib.count('obsidian'))
console.log('Initial water_bucket:', lib.count('water_bucket'))

// 1. Equip diamond pickaxe and dig divider 1 at (350, -55, -29)
console.log('Digging divider 1 at (350, -55, -29)...')
await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
await lib.dig(350, -55, -29)
await sleep(1500)

// 2. Dig divider 2 at (351, -55, -28)
console.log('Digging divider 2 at (351, -55, -28)...')
await lib.dig(351, -55, -28)
await sleep(2000)

const t1 = bot.blockAt(new Vec3(350, -55, -28))?.name
const t2 = bot.blockAt(new Vec3(351, -55, -27))?.name
console.log(`Target 1 at (350, -55, -28): ${t1}`)
console.log(`Target 2 at (351, -55, -27): ${t2}`)

// 3. Scoop water back with empty bucket
console.log('Scooping water source...')
await bot.equip(mcData.itemsByName.bucket.id, 'hand')
await bot.lookAt(new Vec3(349.5, -54.8, -28.8), true)
await sleep(200)
bot.activateItem()
await sleep(1000)
console.log('Water buckets in inventory:', lib.count('water_bucket'))

// Wait for flowing water to clear
await sleep(1000)

// 4. Mine target 1
if (bot.blockAt(new Vec3(350, -55, -28))?.name === 'obsidian') {
  console.log('Mining obsidian 1 at (350, -55, -28)...')
  await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
  await lib.dig(350, -55, -28)
  await lib.pickup(4)
} else {
  console.log('Warning: target 1 is not obsidian:', bot.blockAt(new Vec3(350, -55, -28))?.name)
}

// 5. Mine target 2
if (bot.blockAt(new Vec3(351, -55, -27))?.name === 'obsidian') {
  console.log('Mining obsidian 2 at (351, -55, -27)...')
  await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
  await lib.dig(351, -55, -27)
  await lib.pickup(4)
} else {
  console.log('Warning: target 2 is not obsidian:', bot.blockAt(new Vec3(351, -55, -27))?.name)
}

const finalObsidian = lib.count('obsidian')
console.log('FINAL OBSIDIAN COUNT:', finalObsidian)
return {
  obsidian: finalObsidian,
  waterBuckets: lib.count('water_bucket'),
  diamondPickDurability: bot.inventory.items().find(i => i.name === 'diamond_pickaxe') ? (1561 - bot.inventory.items().find(i => i.name === 'diamond_pickaxe').metadata) : 0
}
