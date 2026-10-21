const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 64, count: 20 })
console.log(`Found ${ores.length} iron ores within 64 blocks:`)
for (const o of ores) {
  console.log(`- ${o.name} at (${o.position.x}, ${o.position.y}, ${o.position.z}) dist: ${bot.entity.position.distanceTo(o.position).toFixed(1)}`)
}
