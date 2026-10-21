// 019-enter-and-bed.js - enter base, scan interior, place bed, set spawn
console.log('Starting from outside at:', lib.fmt(bot.entity.position))

// 1. Walk to door approach at (294, 72, -52)
await lib.goTo(294, 72, -52, 1)

// 2. Open door, walk inside to (294, -56), close door
try {
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -56)
  await lib.door(294, 72, -54, false)
} catch (e) {
  console.log('Door passage note:', e.message)
}
console.log('Inside base at:', lib.fmt(bot.entity.position))

// 3. Scan all interior blocks at y=72
console.log('Scanning interior at y=72 and y=71:')
const interior = []
for (let x = 293; x <= 295; x++) {
  for (let z = -57; z <= -55; z++) {
    const b = lib.blockAt(x, 72, z)
    const floor = lib.blockAt(x, 71, z)
    console.log(`(${x}, 72, ${z}): ${b?.name} [floor: ${floor?.name}]`)
    if (b?.name === 'air' && floor?.boundingBox === 'block') {
      interior.push({ x, y: 72, z })
    }
  }
}
console.log('Empty floor spots:', interior.map(p => lib.fmt(p)).join(', '))

// Try placing bed
if (lib.count('white_bed') > 0) {
  console.log('Attempting to place white_bed...')
  let placed = false
  for (const p of interior) {
    try {
      await lib.place('white_bed', p.x, p.y, p.z)
      console.log(`SUCCESS: Bed placed at (${p.x}, ${p.y}, ${p.z})!`)
      placed = true
      break
    } catch (e) {
      console.log(`Failed at (${p.x}, ${p.y}, ${p.z}):`, e.message)
    }
  }

  if (placed || lib.find('white_bed', { maxDistance: 8 }).length > 0) {
    console.log('Setting spawn point...')
    try {
      await lib.setSpawn()
      console.log('SPAWN SUCCESSFULLY SET!')
      bot.chat('beta: Bed placed and spawn set! (Milestone 4 progress)')
    } catch (e) {
      console.log('Set spawn error:', e.message)
    }
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)
return lib.inv()
