// 018-place-bed-and-spawn.js - step up to y=72, place bed properly, set spawn, eat
console.log('Current position:', lib.fmt(bot.entity.position))

// Ascend back to base floor at y=72
await lib.goTo(294, 72, -56, 1, { dig: false })
console.log('Position on base floor:', lib.fmt(bot.entity.position))

// Eat cooked food
await lib.eat()
console.log('Food after eating:', bot.food)

// Check candidate spots for bed inside (293..295, 72, -57..-55)
// A bed needs 2 blocks (e.g. along x or along z) with solid blocks under both.
// Let's check:
// Option 1: (293, 72, -57) to (293, 72, -56)
// Option 2: (294, 72, -57) to (295, 72, -57)
// Option 3: (293, 72, -55) to (294, 72, -55)
const spots = [
  { x: 293, y: 72, z: -56 },
  { x: 294, y: 72, z: -57 },
  { x: 295, y: 72, z: -57 },
  { x: 293, y: 72, z: -55 }
]

for (const s of spots) {
  const b = lib.blockAt(s.x, s.y, s.z)
  const under = lib.blockAt(s.x, s.y - 1, s.z)
  console.log(`Spot (${s.x}, ${s.y}, ${s.z}): ${b?.name}, under: ${under?.name}`)
}

// Try placing bed
console.log('Placing bed...')
let placed = false
for (const s of spots) {
  try {
    await lib.place('white_bed', s.x, s.y, s.z)
    console.log(`Placed white_bed at (${s.x}, ${s.y}, ${s.z})`)
    placed = true
    break
  } catch (e) {
    console.log(`Could not place bed at (${s.x}, ${s.y}, ${s.z}):`, e.message)
  }
}

// Set spawn
if (placed || lib.find('white_bed', { maxDistance: 16 }).length > 0) {
  console.log('Setting spawn...')
  try {
    await lib.setSpawn()
    console.log('SPAWN SUCCESSFULLY SET!')
    bot.chat('beta: Bed placed and spawn set! (Milestone 4 progress)')
  } catch (e) {
    console.log('Set spawn note:', e.message)
  }
}

// Deposit non-essentials into chest at (293, 72, -57)
try {
  await lib.deposit({ leather: 'all', stick: 8, birch_log: 'all', wooden_pickaxe: 'all' }, 293, 72, -57)
} catch (e) {
  console.log('Deposit note:', e.message)
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left:', lib.time().secondsUntilNight)
return lib.inv()
