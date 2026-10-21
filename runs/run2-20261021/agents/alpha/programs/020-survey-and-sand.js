// programs/020-survey-and-sand.js
console.log('alpha at:', lib.fmt(bot.entity.position))

// Check ground heights at (15, -15) to (19, -11)
const footprintHeights = {}
for (let x = 15; x <= 19; x++) {
  for (let z = -15; z <= -11; z++) {
    let y = 80
    while (y > 50 && bot.blockAt(new Vec3(x, y, z))?.boundingBox !== 'block') y--
    footprintHeights[`(${x},${z})`] = y
  }
}
console.log('Footprint (15..19, -15..-11) heights:', JSON.stringify(footprintHeights))

// Collect sand from a safe spot (e.g. x: 5..8, z: -15..-12, y >= 65)
const sandBlocks = lib.find('sand', { maxDistance: 16, count: 40 })
  .filter(b => b.position.y >= 65 && (b.position.x < 14 || b.position.x > 20 || b.position.z < -16 || b.position.z > -10))

console.log('Safe sand blocks found to dig:', sandBlocks.length)

let dug = 0
for (const b of sandBlocks) {
  if (lib.count('sand') >= 32) break
  try {
    await lib.dig(b.position.x, b.position.y, b.position.z)
    dug++
    if (dug % 4 === 0) await lib.pickup(6)
  } catch (e) {
    console.log('dig sand err:', e.message)
  }
}
await lib.pickup(8)
console.log('Sand collected:', lib.count('sand'))

// Craft sandstone if we have sand
if (lib.count('sand') >= 4) {
  const craftable = Math.floor(lib.count('sand') / 4)
  console.log(`Crafting ${craftable} sandstone...`)
  try {
    await lib.craft('sandstone', craftable)
    console.log('Sandstone count now:', lib.count('sandstone'))
  } catch (e) {
    console.log('craft sandstone err:', e.message)
  }
}

// Check beta
const beta = bot.players.beta?.entity
if (beta) {
  console.log('BETA IS HERE at:', lib.fmt(beta.position))
} else {
  console.log('Beta not in loaded chunks')
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
return lib.status()
