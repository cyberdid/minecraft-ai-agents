const pos = bot.entity.position.floored()
console.log('Current pos:', lib.fmt(pos))

// Check ground blocks below alpha
for (let dy = 0; dy >= -5; dy--) {
  const b = bot.blockAt(pos.offset(0, dy, 0))
  console.log(`y=${pos.y + dy}:`, b?.name)
}

// Find any exposed stone or cobblestone nearby
const stoneBlocks = bot.findBlocks({
  matching: b => b.name === 'stone' || b.name === 'cobblestone' || b.name.includes('stone'),
  maxDistance: 64,
  count: 5
})
console.log('Stone-like blocks nearby:', stoneBlocks.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`).join(', ') || 'none')

// Let's also check for animals (cows, pigs, sheep)
const animal = bot.nearestEntity(e => ['cow', 'pig', 'sheep', 'chicken'].includes(e.name))
console.log('Nearest animal:', animal ? `${animal.name} at ${lib.fmt(animal.position)}` : 'none')
