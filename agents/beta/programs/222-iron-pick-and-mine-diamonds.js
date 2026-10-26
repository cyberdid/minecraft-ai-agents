console.log('=== Craft Iron Pickaxe & Mine Diamond Cluster ===')

// 1. Craft furnace
if (lib.count('furnace') === 0 && lib.count('cobblestone') >= 8) {
  console.log('Crafting furnace...')
  await lib.craft('furnace', 1)
}

// 2. Smelt 3 raw iron
console.log('Smelting 3 raw iron on site...')
const s = await lib.smelt('raw_iron', 'oak_planks', 3)
console.log('Smelt result:', JSON.stringify(s))
console.log('Iron ingots on beta:', lib.count('iron_ingot'))

// 3. Craft iron pickaxe
if (lib.count('iron_ingot') >= 3) {
  console.log('Crafting iron_pickaxe...')
  await lib.craft('iron_pickaxe', 1)
  console.log('Iron pickaxe crafted!')
  await bot.equip(mcData.itemsByName.iron_pickaxe.id, 'hand')
}

// 4. Dig down to diamond ore at (310, 2, -44)
console.log('Digging down to diamond ore at (310, 2, -44)...')
await lib.goTo(310, 2, -44, 1, { dig: true, timeoutMs: 60000 })
console.log('Arrived at diamond depth! Pos:', lib.fmt(bot.entity.position))

// 5. Mine diamonds with iron pickaxe
const diamondOres = bot.findBlocks({
  matching: b => b && (b.name === 'diamond_ore' || b.name === 'deepslate_diamond_ore'),
  maxDistance: 8,
  count: 5
})
console.log(`Found ${diamondOres.length} diamond ores in reach:`, diamondOres.map(p => lib.fmt(p)))

for (const p of diamondOres) {
  console.log(`Mining diamond ore at ${lib.fmt(p)} with iron_pickaxe...`)
  await bot.equip(mcData.itemsByName.iron_pickaxe.id, 'hand')
  await lib.dig(p.x, p.y, p.z)
  await sleep(200)
  await lib.pickup(4)
}

console.log('Diamonds on beta:', lib.count('diamond'))

// 6. Craft diamond_pickaxe
if (lib.count('diamond') >= 3) {
  console.log('Crafting diamond_pickaxe...')
  await lib.craft('diamond_pickaxe', 1)
  console.log('DIAMOND PICKAXE CRAFTED!')
  bot.chat('Milestone 6 COMPLETE: Beta crafted a diamond_pickaxe!')
}

console.log('Final tools:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
