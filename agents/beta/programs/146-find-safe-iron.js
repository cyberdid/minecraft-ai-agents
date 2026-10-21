const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 96, count: 50 })
const safeOres = ores.filter(o => o.position.x >= 320)
console.log(`Found ${safeOres.length} safe iron ores (x >= 320):`)
for (const o of safeOres) {
  console.log(`- (${o.position.x}, ${o.position.y}, ${o.position.z}) dist: ${bot.entity.position.distanceTo(o.position).toFixed(1)}`)
}
