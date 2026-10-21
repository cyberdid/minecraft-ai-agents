console.log('Completing walk to (340, 75, -30)...')
await lib.goTo(340, 75, -30, 2)
console.log('Arrived at east hill:', bot.entity.position)

// Look for Alpha
const alpha = Object.values(bot.entities).find(e => e.username === 'alpha')
if (alpha) {
  console.log(`Alpha is at: (${alpha.position.x.toFixed(1)}, ${alpha.position.y.toFixed(1)}, ${alpha.position.z.toFixed(1)}) dist: ${bot.entity.position.distanceTo(alpha.position).toFixed(1)}`)
  bot.chat(`beta: I am at east hill with you alpha!`)
}

// Find iron ores
const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 20 })
console.log(`Found ${ores.length} iron ores:`, ores.map(o => `(${o.position.x},${o.position.y},${o.position.z})`).join('; '))

if (ores.length > 0) {
  for (const ore of ores) {
    if (lib.count('raw_iron') >= 12) break
    console.log(`Mining iron ore at (${ore.position.x}, ${ore.position.y}, ${ore.position.z})...`)
    try {
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true })
      await lib.dig(ore.position.x, ore.position.y, ore.position.z)
      await lib.pickup(4)
    } catch (e) {
      console.log('Mine note:', e.message)
    }
  }
}

console.log('Raw iron in inventory:', lib.count('raw_iron'))
return { rawIron: lib.count('raw_iron'), inv: lib.inv(), pos: bot.entity.position }
