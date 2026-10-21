// programs/014-find-dry-dirt.js
const p = bot.entity.position
console.log('alpha at:', lib.fmt(p))

// Search for dirt on dry land (y >= 64)
const dirtBlocks = bot.findBlocks({
  matching: mcData.blocksByName.dirt.id,
  maxDistance: 64,
  count: 30
}).filter(bpos => bpos.y >= 64)

console.log('dry dirt blocks found (y>=64):', dirtBlocks.length)
if (dirtBlocks.length > 0) {
  console.log('first 3 dry dirt blocks:', dirtBlocks.slice(0, 3).map(b => lib.fmt(b)))
}

// Check dead bushes
const deadBushes = bot.findBlocks({
  matching: mcData.blocksByName.dead_bush.id,
  maxDistance: 32,
  count: 10
})
console.log('dead bushes:', deadBushes.length)

return { dryDirt: dirtBlocks.length, deadBushes: deadBushes.length }
