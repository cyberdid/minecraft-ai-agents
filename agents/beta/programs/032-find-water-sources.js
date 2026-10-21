// Find all water source blocks (metadata === 0)
const b = bot
const waterVecs = b.findBlocks({
  matching: bl => bl && (bl.name === 'water' || bl.name === 'flowing_water'),
  maxDistance: 16,
  count: 50
})

const sources = []
for (const p of waterVecs) {
  const bl = b.blockAt(p)
  if (bl && bl.metadata === 0) {
    sources.push({ pos: p, name: bl.name })
  }
}
console.log('Water source blocks (metadata 0):', JSON.stringify(sources))
return { sources }
