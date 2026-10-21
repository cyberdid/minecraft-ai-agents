// Inspect blocks around beta at (351, -54, -30)
const b = bot
console.log('Beta pos:', bot.entity.position)

const obsidian = b.findBlocks({
  matching: bl => bl && bl.name === 'obsidian',
  maxDistance: 16,
  count: 30
})
console.log('Obsidian blocks found within 16:', obsidian.length)
for (const p of obsidian) {
  console.log('  Obsidian at:', p)
}

const water = b.findBlocks({
  matching: bl => bl && (bl.name === 'water' || bl.name === 'flowing_water'),
  maxDistance: 16,
  count: 30
})
console.log('Water blocks found within 16:', water.length)
for (const p of water) {
  const bl = b.blockAt(p)
  console.log(`  Water (${bl.name}, metadata=${bl.metadata}) at:`, p)
}

const lava = b.findBlocks({
  matching: bl => bl && (bl.name === 'lava' || bl.name === 'flowing_lava'),
  maxDistance: 16,
  count: 30
})
console.log('Lava blocks found within 16:', lava.length)

return { obsidianCount: obsidian.length, waterCount: water.length, lavaCount: lava.length }
