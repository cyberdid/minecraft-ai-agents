// Check blocks at (349, -55, -30) and find water source
const b = bot
console.log('(349, -55, -30):', b.blockAt(new Vec3(349, -55, -30))?.name)
console.log('(349, -54, -30):', b.blockAt(new Vec3(349, -54, -30))?.name)

const water = b.findBlocks({
  matching: bl => bl && (bl.name === 'water' || bl.name === 'flowing_water'),
  maxDistance: 8,
  count: 20
})
console.log('Water blocks count:', water.length)
for (const p of water) {
  const bl = b.blockAt(p)
  console.log(`Water at ${p} (${bl.name}, meta=${bl.metadata})`)
}

const obs = b.findBlocks({
  matching: bl => bl && bl.name === 'obsidian',
  maxDistance: 8,
  count: 10
})
console.log('Obsidian blocks found:', obs.length)
for (const p of obs) {
  console.log('Obsidian at', p)
}
return { obsCount: obs.length, waterCount: water.length }
