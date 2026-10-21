// 030-mine-north-iron.js - locate and mine safe iron ore north/east of base (avoiding water cave)
console.log('Position:', lib.fmt(bot.entity.position))
console.log('Time left in day:', lib.time().secondsUntilNight)

// Find iron ore
const allIron = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 64, count: 30 })
console.log('Total iron blocks found within 64 blocks:', allIron.length)

// Filter out dangerous blocks near flooded cave (x < 291 && y < 66)
const safeIron = allIron.filter(b => {
  const isDangerZone = b.position.x < 291 && b.position.y < 66 && b.position.z >= -60 && b.position.z <= -45
  return !isDangerZone
})

console.log('Safe iron blocks count:', safeIron.length)
if (safeIron.length > 0) {
  console.log('Safe iron targets:', safeIron.slice(0, 5).map(b => `${b.name} at ${lib.fmt(b.position)}`).join(', '))
}

// Target the closest safe iron
if (safeIron.length > 0) {
  const target = safeIron[0]
  console.log('Targeting iron at:', lib.fmt(target.position))
  bot.chat(`beta: Mining safe iron vein at ${lib.fmt(target.position)}`)
  
  // Dig staircase or navigate to ore
  try {
    await lib.goTo(target.position.x, target.position.y + 1, target.position.z, 2, { dig: true })
    console.log('Reached near target position:', lib.fmt(bot.entity.position))
    
    // Mine all adjacent iron blocks
    const nearbyOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 5 })
    for (const ore of nearbyOres) {
      console.log('Digging ore at:', lib.fmt(ore.position))
      await lib.dig(ore.position.x, ore.position.y, ore.position.z)
    }
  } catch (e) {
    console.log('Mining navigation error:', e.message)
  }
}

// Pickup drops
await lib.pickup(8)

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Raw iron count:', lib.count('raw_iron'))
console.log('Time left in day:', lib.time().secondsUntilNight)

bot.chat(`beta: Have ${lib.count('raw_iron')} raw_iron.`)
return { raw_iron: lib.count('raw_iron'), inv: lib.inv() }
