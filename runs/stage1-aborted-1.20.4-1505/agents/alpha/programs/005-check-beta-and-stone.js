const beta = bot.players.beta
if (beta && beta.entity) {
  console.log('beta pos:', lib.fmt(beta.entity.position))
  console.log('beta held:', beta.entity.heldItem?.name)
} else {
  console.log('beta entity not loaded')
}

// Check where the surface slopes down, or where exposed stone is reachable
const nearestStone = bot.findBlocks({
  matching: b => b.name === 'stone' || b.name === 'cobblestone',
  maxDistance: 64,
  count: 1
})
console.log('Nearest stone:', nearestStone[0] ? lib.fmt(nearestStone[0]) : 'none')
