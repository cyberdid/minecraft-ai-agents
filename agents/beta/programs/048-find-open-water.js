// Find surface water with open air above
const b = bot
const water = b.findBlocks({
  matching: bl => bl && bl.name === 'water' && bl.metadata === 0,
  maxDistance: 64,
  count: 50
}).filter(p => p.y >= 60 && b.blockAt(p.offset(0, 1, 0))?.name === 'air')

console.log('Open surface water blocks found:', water.length)
for (const p of water.slice(0, 5)) {
  console.log('  Water at:', p)
}
return { openWaterCount: water.length }
