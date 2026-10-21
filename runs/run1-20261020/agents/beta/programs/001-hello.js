const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

console.log('Bot username:', bot.username)
console.log('Position:', bot.entity.position)
console.log('Time of day:', bot.time.timeOfDay)

// Check for teammate alpha
const alpha = bot.players['alpha']
if (alpha && alpha.entity) {
  console.log('Alpha found at:', alpha.entity.position)
} else {
  console.log('Alpha entity not yet in visual range or not spawned')
}

// Find nearby blocks
const woodTypes = ['oak_log', 'birch_log', 'spruce_log', 'dark_oak_log', 'acacia_log', 'mangrove_log', 'cherry_log']
const woodBlocks = bot.findBlocks({
  matching: (block) => woodTypes.includes(block.name),
  maxDistance: 32,
  count: 5
})
console.log('Nearby wood blocks:', woodBlocks.length ? woodBlocks : 'none found within 32 blocks')

// Chat greeting
bot.chat("Hello alpha! I'm beta. Ready to build!")
await new Promise(r => setTimeout(r, 1000))
bot.chat("Let's build a wooden cabin near spawn. What do you think?")

return {
  pos: bot.entity.position,
  alphaPos: alpha?.entity?.position || null,
  nearbyWoodCount: woodBlocks.length
}
