// Find air blocks in the lower cave and their positions relative to our tunnel
const p = bot.entity.position.floored()
const airVecs = bot.findBlocks({
  matching: b => b && (b.name === 'air' || b.name === 'cave_air'),
  maxDistance: 20,
  count: 100
}).filter(v => v.y <= -46)

console.log('Air blocks at <= -46:', airVecs.length)
if (airVecs.length > 0) {
  airVecs.sort((a, b) => a.distanceTo(p) - b.distanceTo(p))
  for (let i = 0; i < Math.min(5, airVecs.length); i++) {
    console.log(`Cave air ${i}:`, airVecs[i], 'dist:', airVecs[i].distanceTo(p).toFixed(1))
  }
}
