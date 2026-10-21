console.log('Starting iron mining run...')
bot.chat('beta: Heading to iron vein at (311, 62, -65) to get raw iron!')

const movements = new Movements(bot, mcData)
movements.canDig = true
bot.pathfinder.setMovements(movements)

// 1. Move to surface above vein at (311, 65, -65)
console.log('Moving to (311, 65, -65)...')
await bot.pathfinder.goto(new goals.GoalNear(311, 65, -65, 2))
console.log('Arrived above vein:', bot.entity.position)

// 2. Find all iron ores within 16 blocks
let mined = 0
for (let attempt = 0; attempt < 15; attempt++) {
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 16, count: 10 })
  if (ores.length === 0) {
    console.log('No more iron ores nearby')
    break
  }
  const target = ores[0].position
  console.log(`Mining iron ore at (${target.x}, ${target.y}, ${target.z})...`)
  try {
    await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand')
    await bot.pathfinder.goto(new goals.GoalLookAtBlock(target, bot.world))
    await lib.dig(target.x, target.y, target.z)
    await lib.pickup(4)
    mined++
  } catch (e) {
    console.log('Dig error:', e.message)
    break
  }
}

console.log(`Mined ${mined} iron ores!`)
console.log('Raw iron in inventory:', lib.count('raw_iron'))
bot.chat(`beta: Mined ${lib.count('raw_iron')} raw iron! Returning to base to smelt.`)

// 3. Return to base
console.log('Returning to base at (294, 72, -54)...')
await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2))
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {}

console.log('Inside base. Starting smelting...')

// 4. Smelt raw iron in furnace at (295, 72, -55) using oak planks
if (lib.count('raw_iron') > 0) {
  try {
    const smeltRes = await lib.smelt('raw_iron', 'oak_planks', lib.count('raw_iron'))
    console.log('Smelt result:', smeltRes)
  } catch (e) {
    console.log('Smelt note:', e.message)
  }
}

console.log('Final inventory:', JSON.stringify(lib.inv()))
return { rawIron: lib.count('raw_iron'), ironIngots: lib.count('iron_ingot') }
