console.log('Continuing down to y=-54 from', bot.entity.position)

// Set pathfinder movements to allow sprinting and walking down stairs
const movements = new Movements(bot, mcData)
movements.canDig = false
bot.pathfinder.setMovements(movements)

console.log('Pathing to (350, -54, -30)...')
await bot.pathfinder.goto(new goals.GoalNear(350, -54, -30, 3))
console.log('Arrived at:', bot.entity.position)

// Scan for items and pick them all up
console.log('Sweeping for items...')
for (let i = 0; i < 5; i++) {
  const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.y < -50)
  console.log(`Round ${i+1}: ${items.length} items left`)
  if (items.length === 0) break
  for (const it of items) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 1))
    } catch (e) {}
  }
  await lib.pickup(10)
}

// Equip armor
console.log('Equipping armor...')
try { await lib.equipArmor() } catch (e) { console.log('equipArmor error:', e.message) }

console.log('Inventory after recovery:', JSON.stringify(lib.inv()))
console.log('Obsidian count:', lib.count('obsidian'))
console.log('Diamond pickaxe count:', lib.count('diamond_pickaxe'))
