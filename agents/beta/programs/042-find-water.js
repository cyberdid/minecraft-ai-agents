// Find water sources within 64 blocks
const b = bot
const waterBlocks = b.findBlocks({
  matching: bl => bl && bl.name === 'water' && bl.metadata === 0,
  maxDistance: 64,
  count: 10
})
console.log('Water source blocks found:', waterBlocks.length)
for (const p of waterBlocks) {
  console.log('  Water at:', p, 'above:', b.blockAt(p.offset(0, 1, 0))?.name)
}
return { waterCount: waterBlocks.length }
