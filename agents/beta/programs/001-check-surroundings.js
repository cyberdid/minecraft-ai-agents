// Check hostiles, nearby lava, and position
const hostiles = lib.hostiles(24)
console.log('Hostiles:', JSON.stringify(hostiles))
const lava = bot.findBlocks({
  matching: b => b.name === 'lava',
  maxDistance: 48,
  count: 20
})
console.log('Found lava blocks:', lava.length)
if (lava.length > 0) {
  console.log('Nearest lava:', lava[0])
}
return { pos: bot.entity.position, lavaCount: lava.length, hostiles }
