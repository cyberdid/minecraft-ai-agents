// Find where the placed lava is
const b = bot
const lava = b.findBlocks({
  matching: bl => bl && (bl.name === 'lava' || bl.name === 'flowing_lava'),
  maxDistance: 6,
  count: 10
})
console.log('Nearby lava blocks:', lava.length)
for (const p of lava) {
  const bl = b.blockAt(p)
  console.log(`Lava at ${p} (${bl.name}, meta=${bl.metadata}), under=${b.blockAt(p.offset(0, -1, 0))?.name}`)
}
return { lava }
