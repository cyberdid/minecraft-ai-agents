// Check all lava blocks in the world right now
const b = bot
const lava = b.findBlocks({
  matching: bl => bl && bl.name === 'lava' && bl.metadata === 0,
  maxDistance: 32,
  count: 20
})
console.log('Lava sources count:', lava.length)
for (const p of lava) {
  const up = b.blockAt(p.offset(0, 1, 0))?.name
  console.log(`Lava at ${p}, above=${up}`)
}
return { count: lava.length }
