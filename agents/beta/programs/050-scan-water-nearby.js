// Check for any accessible water nearby
const b = bot
console.log('Scanning surrounding blocks for any water...')
const water = b.findBlocks({
  matching: bl => bl && (bl.name === 'water' || bl.name === 'flowing_water'),
  maxDistance: 64,
  count: 20
})
console.log('Water blocks count within 64:', water.length)
for (const p of water.slice(0, 10)) {
  const bl = b.blockAt(p)
  console.log(`Water at ${p} (${bl.name}, meta=${bl.metadata}): dist=${p.distanceTo(bot.entity.position).toFixed(1)}`)
}
return { waterCount: water.length }
