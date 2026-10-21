const waters = bot.findBlocks({
  matching: b => b.name === 'water',
  maxDistance: 16,
  count: 10
})
console.log('Water blocks found:', waters.length)
for (const p of waters) {
  const b = bot.blockAt(p)
  console.log(`Water at (${p.x}, ${p.y}, ${p.z}) | meta: ${b ? b.metadata : 'null'}`)
}
