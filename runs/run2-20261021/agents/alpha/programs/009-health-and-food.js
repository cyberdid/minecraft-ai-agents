// programs/009-health-and-food.js
console.log('alpha at:', lib.fmt(bot.entity.position), 'health:', bot.health, 'food:', bot.food)

// Collect 4 more dirt safely so we have 16 dirt
if (lib.count('dirt') < 16) {
  const needed = 16 - lib.count('dirt')
  console.log(`Collecting ${needed} more dirt...`)
  try {
    await lib.collect('dirt', needed, { maxDistance: 16 })
  } catch (e) {
    console.log('dirt collect warning:', e.message)
  }
}

// Find passive food sources nearby
const animals = ['cow', 'pig', 'sheep', 'chicken']
const nearbyAnimals = Object.values(bot.entities)
  .filter(e => animals.includes(e.name) && e.position.distanceTo(bot.entity.position) <= 32)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position))

console.log('Nearby animals count:', nearbyAnimals.length)
if (nearbyAnimals.length > 0) {
  const target = nearbyAnimals[0]
  console.log(`Approaching ${target.name} at ${lib.fmt(target.position)} (dist: ${Math.round(target.position.distanceTo(bot.entity.position))})...`)
  await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2))
  // attack repeatedly until dead or moved away
  for (let i = 0; i < 8; i++) {
    if (!bot.entities[target.id]) break
    bot.attack(target)
    await sleep(650)
  }
  await lib.pickup(8)
  console.log('Inventory after hunt:', JSON.stringify(lib.inv()))
  if (lib.count('mutton') || lib.count('beef') || lib.count('porkchop') || lib.count('chicken')) {
    console.log('Eating meat to get food >= 18 for health regen...')
    try { await lib.eat() } catch (err) { console.log('eat err:', err.message) }
  }
}

return lib.status()
