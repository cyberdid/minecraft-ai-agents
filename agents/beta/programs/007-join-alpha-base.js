// 007-join-alpha-base.js - move into the base with alpha, place door, check walls/roof
bot.chat('beta: Coming into the base at (294, 72, -56) with door, chest, and planks!')

// Step up to y=72
console.log('Moving into base...')
await lib.goTo(294, 72, -56, 1, { dig: true })
console.log('Position now:', lib.fmt(bot.entity.position))

// Check south wall at z=-54 for door spot
// Footprint is x: 292..296, z: -58..-54. South wall is z=-54.
// Middle is x=294, z=-54.
const doorBottom = lib.blockAt(294, 72, -54)
const underDoor = lib.blockAt(294, 71, -54)
console.log('Under door at (294, 71, -54):', underDoor?.name)
console.log('Door spot at (294, 72, -54):', doorBottom?.name)

if (doorBottom?.name === 'air' && underDoor?.boundingBox === 'block') {
  console.log('Placing oak_door at (294, 72, -54)...')
  try {
    await lib.place('oak_door', 294, 72, -54)
    console.log('Door placed!')
  } catch (e) {
    console.log('Door placement error:', e.message)
  }
}

// Place chest inside base (e.g. at 293, 72, -57)
const chestSpot = lib.blockAt(293, 72, -57)
if (chestSpot?.name === 'air') {
  try {
    await lib.place('chest', 293, 72, -57)
    console.log('Chest placed at (293, 72, -57)')
  } catch (e) {
    console.log('Chest placement note:', e.message)
  }
}

// Check time and hostiles
console.log('Time:', lib.time())
console.log('Hostiles:', lib.hostiles(16))
