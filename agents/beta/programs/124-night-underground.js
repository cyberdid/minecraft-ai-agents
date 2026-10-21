const ores = lib.find(['iron_ore', 'deepslate_iron_ore', 'coal_ore', 'deepslate_coal_ore'], { maxDistance: 16, count: 10 })
console.log('Ores nearby at y=62:', ores.map(o => `${o.name} at (${o.position.x},${o.position.y},${o.position.z})`))
console.log('Time info:', lib.time())
return { ores: ores.length, time: lib.time() }
