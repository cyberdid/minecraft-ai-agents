// Find the placed water block
const b = bot
const water = b.findBlocks({
  matching: bl => bl && (bl.name === 'water' || bl.name === 'flowing_water'),
  maxDistance: 6,
  count: 10
})
console.log('Water blocks count:', water.length)
for (const p of water) {
  const bl = b.blockAt(p)
  console.log(`Water at ${p} (${bl.name}, meta=${bl.metadata})`)
}
return { water }
