// Scan surrounding air blocks to see where the cave is
const p = bot.entity.position.floored()
console.log('Current position:', p)
const airBlocks = bot.findBlocks({
  matching: b => b.name === 'air' || b.name === 'cave_air',
  maxDistance: 16,
  count: 200
})
console.log('Total air blocks within 16:', airBlocks.length)
// Group air blocks by Y
const airByY = {}
for (const a of airBlocks) {
  airByY[a.y] = (airByY[a.y] || 0) + 1
}
console.log('Air blocks by Y level:', airByY)
return { airByY }
