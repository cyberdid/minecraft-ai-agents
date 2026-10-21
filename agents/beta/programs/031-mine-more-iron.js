// 031-mine-more-iron.js - mine the vein at (296..297, 52, -62), return to base, smelt, craft iron_pickaxe & shield
console.log('Position underground:', lib.fmt(bot.entity.position))
console.log('Time left:', lib.time().secondsUntilNight)

// Find ores within 16 blocks
const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 16 })
console.log(`Found ${ores.length} iron ore blocks within 16 blocks`)

for (const ore of ores) {
  if (lib.time().secondsUntilNight < 90) {
    console.log('Night approaching, stopping mining to return to base')
    break
  }
  console.log(`Mining ore at ${lib.fmt(ore.position)}...`)
  try {
    await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true })
    await lib.dig(ore.position.x, ore.position.y, ore.position.z)
  } catch (e) {
    console.log('Mine block error:', e.message)
  }
}

// Pickup drops
await lib.pickup(10)
const rawCount = lib.count('raw_iron')
console.log('Raw iron count after mining:', rawCount)

bot.chat(`beta: Mined iron vein! Now have ${rawCount} raw_iron. Returning to base to smelt.`)

// Return to base at y=72
console.log('Returning to base floor...')
try {
  await lib.goTo(294, 72, -55, 1, { dig: true })
  console.log('Inside base at:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Return to base error:', e.message)
}

// Smelt raw iron if we have at least 3
if (lib.count('raw_iron') >= 3 && lib.find('furnace', { maxDistance: 6 }).length > 0) {
  console.log(`Smelting ${lib.count('raw_iron')} raw_iron...`)
  try {
    await lib.smelt('raw_iron', 'birch_planks', lib.count('raw_iron'))
    console.log('Smelting complete! Iron ingots:', lib.count('iron_ingot'))
  } catch (e) {
    console.log('Smelt note:', e.message)
  }
}

// Craft iron pickaxe
if (lib.count('iron_ingot') >= 3 && lib.count('iron_pickaxe') === 0) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4)
  console.log('Crafting iron_pickaxe...')
  try {
    await lib.craft('iron_pickaxe', 1)
    console.log('Iron pickaxe crafted!')
    bot.chat('beta: Milestone 2 progress: Crafted iron pickaxe!')
  } catch (e) {
    console.log('Craft iron pickaxe note:', e.message)
  }
}

// Craft shield
if (lib.count('iron_ingot') >= 1 && lib.count('shield') === 0) {
  if (lib.count('*_planks') < 6) await lib.craft('birch_planks', 4)
  console.log('Crafting shield...')
  try {
    await lib.craft('shield', 1)
    await lib.equipArmor()
    console.log('Shield crafted and equipped!')
    bot.chat('beta: Shield equipped!')
  } catch (e) {
    console.log('Shield note:', e.message)
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Time left in day:', lib.time().secondsUntilNight)

return { raw_iron: lib.count('raw_iron'), iron_ingot: lib.count('iron_ingot'), tools: lib.tools() }
