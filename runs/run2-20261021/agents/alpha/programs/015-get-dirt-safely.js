// programs/015-get-dirt-safely.js
bot.chat("beta: What's your status on wood? I'm getting 16 dirt at (0, 64, -55). Night in ~250s.")

console.log('Moving to (0, 64, -55)...')
await lib.goTo(0, 64, -55, 1)
console.log('Arrived at:', lib.fmt(bot.entity.position))

// Find dirt where y >= 64 so we stay on dry land
const matchDirt = (b) => b && b.name === 'dirt' && b.position.y >= 64
const dryDirts = bot.findBlocks({ matching: matchDirt, maxDistance: 16, count: 20 })
console.log('Dry dirt blocks near (0, 64, -55):', dryDirts.length)

// Dig dirt safely
let collected = 0
for (const p of dryDirts) {
  if (lib.count('dirt') >= 16) break
  try {
    await lib.dig(p.x, p.y, p.z)
    collected++
  } catch (err) {
    console.log(`dig at ${lib.fmt(p)} failed:`, err.message)
  }
}
await lib.pickup(8)

console.log('Collected:', collected, 'Dirt now:', lib.count('dirt'))
return lib.status()
