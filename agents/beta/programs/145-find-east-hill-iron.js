const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 96, count: 50 })
const hillOres = ores.filter(o => o.position.x >= 320 && o.position.y >= 65)
console.log(`Found ${hillOres.length} surface/hill iron ores on east hill:`)
for (const o of hillOres) {
  console.log(`- (${o.position.x}, ${o.position.y}, ${o.position.z}) dist: ${bot.entity.position.distanceTo(o.position).toFixed(1)}`)
}
