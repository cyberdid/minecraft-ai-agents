// programs/012-check-spawn-ground.js
const p = bot.entity.position
console.log('alpha at:', lib.fmt(p))

// Scan surface blocks within 15 blocks
const counts = {}
for (let dx = -10; dx <= 10; dx++) {
  for (let dz = -10; dz <= 10; dz++) {
    const b = bot.blockAt(p.offset(dx, -1, dz))
    if (b) counts[b.name] = (counts[b.name] || 0) + 1
  }
}
console.log('Blocks under/around feet:', JSON.stringify(counts))

// Check sand, sandstone, dirt
const sand = bot.findBlocks({ matching: mcData.blocksByName.sand.id, maxDistance: 10, count: 20 })
const sandstone = bot.findBlocks({ matching: mcData.blocksByName.sandstone.id, maxDistance: 10, count: 20 })
console.log('sand count:', sand.length, 'sandstone count:', sandstone.length)

return { sand: sand.length, sandstone: sandstone.length }
