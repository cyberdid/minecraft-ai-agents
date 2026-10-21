// Find lava source blocks (meta 0) with air above them
const b = bot
const lava = b.findBlocks({
  matching: bl => bl && bl.name === 'lava' && bl.metadata === 0,
  maxDistance: 16,
  count: 30
}).filter(p => b.blockAt(p.offset(0, 1, 0))?.name === 'air')

console.log('Lava sources with air above:', lava.length)
for (const p of lava) {
  console.log('  Lava source at:', p, 'under:', b.blockAt(p.offset(0, -1, 0))?.name)
}
return { count: lava.length }
