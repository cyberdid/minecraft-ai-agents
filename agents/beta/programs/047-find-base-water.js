// Find surface water near base
const b = bot
const water = b.findBlocks({
  matching: bl => bl && bl.name === 'water' && bl.metadata === 0,
  maxDistance: 32,
  count: 10
})
console.log('Water sources found within 32:', water.length)
for (const p of water) {
  console.log('  Water at:', p, 'y level:', p.y)
}
return { waterCount: water.length }
