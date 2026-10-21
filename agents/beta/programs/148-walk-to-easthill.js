console.log('Heading to east hill staging point (340, 75, -30)...')
bot.chat('beta: On my way to east hill (340, 75, -30) to mine iron with you alpha!')

const movements = new Movements(bot, mcData)
movements.canDig = false
bot.pathfinder.setMovements(movements)

await bot.pathfinder.goto(new goals.GoalNear(340, 75, -30, 2))
console.log('Arrived at east hill:', bot.entity.position)

// Look for Alpha
const alpha = Object.values(bot.entities).find(e => e.username === 'alpha')
if (alpha) {
  console.log(`Alpha is at: (${alpha.position.x.toFixed(1)}, ${alpha.position.y.toFixed(1)}, ${alpha.position.z.toFixed(1)}) dist: ${bot.entity.position.distanceTo(alpha.position).toFixed(1)}`)
} else {
  console.log('Alpha is farther away')
}

// Find iron ores within reach
const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 48, count: 20 })
console.log(`Found ${ores.length} iron ores around east hill:`, ores.map(o => `(${o.position.x},${o.position.y},${o.position.z})`).join('; '))
