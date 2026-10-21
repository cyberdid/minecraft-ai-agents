const veinPos = new Vec3(311, 57, -61)
console.log('Inspecting vein at (311, 57, -61)...')

// Check surface above vein
for (let y = 75; y >= 55; y--) {
  const p = new Vec3(311, y, -61)
  const b = bot.blockAt(p)
  if (b && b.name !== 'air') {
    console.log(`Highest solid at (311, ${y}, -61) is ${b.name}`)
    break
  }
}

// Find all iron ores in this cluster
const cluster = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  point: veinPos,
  maxDistance: 8,
  count: 15
})
console.log(`Cluster has ${cluster.length} iron ores:`, cluster.map(p => `(${p.x},${p.y},${p.z})`).join('; '))

// Check what Alpha is doing right now
const alpha = Object.values(bot.entities).find(e => e.username === 'alpha')
if (alpha) {
  console.log(`Alpha is at: (${alpha.position.x.toFixed(1)}, ${alpha.position.y.toFixed(1)}, ${alpha.position.z.toFixed(1)}) dist: ${bot.entity.position.distanceTo(alpha.position).toFixed(1)}`)
}
