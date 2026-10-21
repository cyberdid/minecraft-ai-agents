// programs/017-get-grass-block-dirt.js
console.log('alpha at:', lib.fmt(bot.entity.position))

// Move up to dry ground
await lib.goTo(0, 65, -50, 1)
console.log('Now at dry ground:', lib.fmt(bot.entity.position))

// Find grass_block or dirt with y >= 64
const grassBlocks = lib.find(['grass_block', 'dirt'], { maxDistance: 16, count: 30 })
  .filter(b => b.position.y >= 64)
console.log('Safe grass/dirt blocks found:', grassBlocks.length)

let count = lib.count('dirt')
for (const b of grassBlocks) {
  if (count >= 16) break
  // don't dig the block directly under our feet
  if (b.position.distanceTo(bot.entity.position) < 1.2 && b.position.y <= bot.entity.position.y) continue
  try {
    await lib.dig(b.position.x, b.position.y, b.position.z)
    await lib.pickup(4)
    count = lib.count('dirt')
  } catch (err) {
    console.log('dig err:', err.message)
  }
}

await lib.pickup(6)
console.log('Dirt count now:', lib.count('dirt'))
return lib.status()
