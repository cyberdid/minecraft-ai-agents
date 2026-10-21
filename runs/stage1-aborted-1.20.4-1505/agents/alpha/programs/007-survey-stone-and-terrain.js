// Search for stone/cobblestone within 128 blocks
const allStone = bot.findBlocks({
  matching: b => b.name === 'stone' || b.name === 'cobblestone',
  maxDistance: 128,
  count: 20
})
console.log(`Found ${allStone.length} stone blocks within 128m.`)
if (allStone.length > 0) {
  // Sort by highest y first (nearest to surface)
  allStone.sort((a, b) => b.y - a.y)
  for (const s of allStone.slice(0, 5)) {
    console.log(`Stone at ${lib.fmt(s)} (dist: ${Math.round(bot.entity.position.distanceTo(s))})`)
  }
}

// Let's also check directions for terrain height & surface blocks at distance 30
const dirs = [
  { name: 'North', dx: 0, dz: -30 },
  { name: 'South', dx: 0, dz: 30 },
  { name: 'East', dx: 30, dz: 0 },
  { name: 'West', dx: -30, dz: 0 },
]

for (const d of dirs) {
  const targetX = Math.floor(bot.entity.position.x + d.dx)
  const targetZ = Math.floor(bot.entity.position.z + d.dz)
  let y = 80
  while (y > 40 && lib.blockAt(targetX, y, targetZ).boundingBox !== 'block') y--
  const b = lib.blockAt(targetX, y, targetZ)
  console.log(`${d.name} (${targetX}, ${y}, ${targetZ}): ${b.name}`)
}
