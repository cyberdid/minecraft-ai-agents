console.log('=== Step 1: Craft Tools, Mine Iron Vein & Craft Iron Pickaxe ===')

// 1. Craft supplies
if (lib.count('*_log') > 0) {
  console.log('Crafting oak_planks from log...')
  await lib.craft('oak_planks', 8)
}
if (lib.count('stick') < 8 && lib.count('*_planks') >= 4) {
  console.log('Crafting sticks...')
  await lib.craft('stick', 8)
}
if (lib.count('stone_pickaxe') < 3 && lib.count('cobblestone') >= 6) {
  console.log('Crafting stone pickaxes...')
  await lib.craft('stone_pickaxe', 2)
}
if (lib.count('furnace') === 0 && lib.count('cobblestone') >= 8) {
  console.log('Crafting furnace...')
  await lib.craft('furnace', 1)
}

// 2. Step outside base door
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Outside base door:', lib.fmt(bot.entity.position))
} catch (e) {}

bot.chat('beta: Mining iron vein at (300, 52, -40) to craft iron pickaxe for diamonds!')

// 3. Move to surface above iron vein (300, 72, -40)
console.log('Moving to (300, 72, -40)...')
await lib.goTo(300, 72, -40, 2, { timeoutMs: 25000 })
console.log('At surface above iron vein:', lib.fmt(bot.entity.position))

// 4. Dig staircase down to iron vein at (300, 52, -40)
console.log('Digging down to (300, 52, -40)...')
await lib.goTo(300, 52, -40, 2, { dig: true, timeoutMs: 45000 })
console.log('Arrived at iron vein! Pos:', lib.fmt(bot.entity.position))

// 5. Mine all iron ores in the cluster
let mined = 0
for (let i = 0; i < 10; i++) {
  if (isCancelled()) break
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 8, count: 5 })
  if (ores.length === 0) break
  const target = ores[0].position
  console.log(`Mining iron ore at ${lib.fmt(target)}...`)
  try {
    await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand')
    await lib.dig(target.x, target.y, target.z)
    await sleep(200)
    await lib.pickup(4)
    mined++
  } catch (e) {
    console.log('Dig error:', e.message)
    break
  }
}

console.log(`Mined ${mined} iron ores! Raw iron count: ${lib.count('raw_iron')}`)

// 6. Smelt 3 raw iron on site using furnace
if (lib.count('raw_iron') >= 3) {
  console.log('Smelting raw iron for iron pickaxe...')
  try {
    const s = await lib.smelt('raw_iron', 'oak_planks', 3)
    console.log('Smelt completed:', JSON.stringify(s))
  } catch (e) {
    console.log('Smelt note:', e.message)
  }
}

console.log('Iron ingots on beta:', lib.count('iron_ingot'))

// 7. Craft iron_pickaxe
if (lib.count('iron_ingot') >= 3) {
  console.log('Crafting iron_pickaxe...')
  await lib.craft('iron_pickaxe', 1)
  console.log('Iron pickaxe crafted!')
  bot.chat('beta: Iron pickaxe crafted! Ready to mine the diamonds at y=-1.')
}

console.log('Beta tools:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
