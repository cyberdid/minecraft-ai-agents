console.log('=== Surveying Nearby Resources ===')
// 1. Water
const water = bot.findBlocks({
  matching: b => b && (b.name === 'water' || b.name === 'flowing_water'),
  maxDistance: 48,
  count: 5
})
console.log('Nearby water blocks:', water.map(p => `${lib.fmt(p)} (${bot.blockAt(p).name})`))

// 2. Animals
const animals = Object.values(bot.entities).filter(e => 
  e && ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) &&
  e.position.distanceTo(bot.entity.position) < 64
)
console.log('Nearby animals:', animals.map(a => `${a.name} at ${lib.fmt(a.position)} dist ${a.position.distanceTo(bot.entity.position).toFixed(1)}`))

// 3. Iron ore & Coal ore
const ores = bot.findBlocks({
  matching: b => b && (b.name.includes('iron_ore') || b.name.includes('coal_ore')),
  maxDistance: 48,
  count: 10
})
console.log('Nearby ores:', ores.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`))

// 4. Check base door and exit
const doorPos = new Vec3(294, 72, -54)
console.log('Door at', lib.fmt(doorPos), ':', bot.blockAt(doorPos)?.name)
