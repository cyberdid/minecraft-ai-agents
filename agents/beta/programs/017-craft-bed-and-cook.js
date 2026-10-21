// 017-craft-bed-and-cook.js - enter base, craft bed, set spawn, cook food
console.log('Position before entering base:', lib.fmt(bot.entity.position))

// Open door and enter base
try {
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -56)
  await lib.door(294, 72, -54, false)
} catch (e) {
  console.log('Door passage note:', e.message)
  await lib.goThroughDoor(294, 72, -54)
}
console.log('Inside base at:', lib.fmt(bot.entity.position))

// Craft bed
console.log('Crafting white_bed...')
await lib.craft('white_bed', 1)
console.log('Bed crafted! Inventory:', JSON.stringify(lib.inv()))

// Place bed at (293, 72, -56) or free spot along wall
const bedSpot = lib.blockAt(293, 72, -56)
console.log('Block at (293, 72, -56):', bedSpot?.name)
if (bedSpot?.name === 'air') {
  try {
    await lib.place('white_bed', 293, 72, -56)
    console.log('Bed placed at (293, 72, -56)')
  } catch (e) {
    console.log('Bed placement error:', e.message)
  }
}

// Set spawn
console.log('Setting spawn...')
try {
  await lib.setSpawn()
  console.log('Spawn successfully set at bed!')
  bot.chat('beta: Spawn set at base bed! (Milestone 4 progress: 1/2 beds)')
} catch (e) {
  console.log('Set spawn error:', e.message)
}

// Smelt beef and mutton in furnace at (295, 72, -55)
if (lib.count('beef') > 0) {
  console.log('Cooking beef...')
  try {
    await lib.smelt('beef', 'oak_planks', lib.count('beef'))
  } catch (e) {
    console.log('Beef cook note:', e.message)
  }
}

if (lib.count('mutton') > 0) {
  console.log('Cooking mutton...')
  try {
    await lib.smelt('mutton', 'oak_planks', lib.count('mutton'))
  } catch (e) {
    console.log('Mutton cook note:', e.message)
  }
}

// Eat cooked food
await lib.eat()

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Health:', bot.health, 'Food:', bot.food)
console.log('Time left in day:', lib.time().secondsUntilNight)

return lib.inv()
