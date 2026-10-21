// programs/005-check-biome-and-view.js
const p = bot.entity.position
const blockUnder = bot.blockAt(p.offset(0, -1, 0))
console.log('block under feet:', blockUnder?.name, 'biome:', blockUnder?.biome?.name)

// Let's sample blocks at ground level in 4 directions at distance 30, 60, 90
const directions = [
  { name: 'North (-Z)', dx: 0, dz: -60 },
  { name: 'South (+Z)', dx: 0, dz: 60 },
  { name: 'East (+X)', dx: 60, dz: 0 },
  { name: 'West (-X)', dx: -60, dz: 0 },
]

for (const d of directions) {
  const targetX = Math.floor(p.x + d.dx)
  const targetZ = Math.floor(p.z + d.dz)
  let y = 100
  while (y > 40 && lib.blockAt(targetX, y, targetZ).boundingBox !== 'block') y--
  const b = lib.blockAt(targetX, y, targetZ)
  console.log(`${d.name} at (${targetX}, ${y}, ${targetZ}): ${b?.name} biome: ${b?.biome?.name}`)
}

return { biome: blockUnder?.biome?.name }
