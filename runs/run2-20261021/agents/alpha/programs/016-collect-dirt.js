// programs/016-collect-dirt.js
console.log('alpha at:', lib.fmt(bot.entity.position))

const dirtBlocks = lib.find('dirt', { maxDistance: 16, count: 30 })
  .filter(b => b.position.y >= 64)
console.log('Found safe dirt blocks:', dirtBlocks.length)

let collected = 0
for (const b of dirtBlocks) {
  if (lib.count('dirt') >= 16) break
  try {
    await lib.dig(b.position.x, b.position.y, b.position.z)
    collected++
    if (collected % 4 === 0) await lib.pickup(6)
  } catch (err) {
    console.log(`dig error:`, err.message)
  }
}
await lib.pickup(8)

console.log('Dirt count now:', lib.count('dirt'))
return lib.status()
