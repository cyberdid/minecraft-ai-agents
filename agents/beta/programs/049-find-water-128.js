// Find open surface water within 128 blocks of base
const b = bot
console.log('Searching for water sources within 128 blocks...')
const water = b.findBlocks({
  matching: bl => bl && bl.name === 'water' && bl.metadata === 0,
  maxDistance: 128,
  count: 100
}).filter(p => p.y >= 62 && b.blockAt(p.offset(0, 1, 0))?.name === 'air')

console.log('Open surface water sources:', water.length)
for (const p of water.slice(0, 5)) {
  console.log('  Water at:', p)
}

bot.chat('alpha: please put water_bucket in chest at (293, 72, -57) for portal')
return { waterCount: water.length, nearest: water[0] }
