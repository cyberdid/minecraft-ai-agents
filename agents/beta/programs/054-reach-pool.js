// Eat to heal, run to pool, and inspect lava targets
await lib.eat().catch(e => console.log('Eat note:', e.message))

console.log('Heading down to pool at (344, -54, -32)...')
await lib.goTo(344, -54, -32, 2)
console.log('At pool! Position:', bot.entity.position)

// Find lava sources
const lava = bot.findBlocks({
  matching: bl => bl && bl.name === 'lava' && bl.metadata === 0,
  maxDistance: 16,
  count: 10
})
console.log('Lava sources found:', lava.length)
for (let i = 0; i < Math.min(5, lava.length); i++) {
  console.log(`  Lava ${i}:`, lava[i])
}
return { pos: bot.entity.position, lavaCount: lava.length }
