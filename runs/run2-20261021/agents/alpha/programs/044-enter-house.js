// programs/044-enter-house.js
bot.chat("beta: All 4 sandstone walls are 100% placed! Coming inside the house.")

console.log('alpha at:', lib.fmt(bot.entity.position))

// Enter the house through the door at (12, 67, -21)
console.log('Entering through door at (12, 67, -21)...')
const res = await lib.goThroughDoor(12, 67, -21, { close: true })
console.log('Door passage result:', res)

console.log('Now inside house at:', lib.fmt(bot.entity.position))

// Check beta
const beta = bot.players.beta?.entity
console.log('Beta pos:', beta ? lib.fmt(beta.position) : 'unknown')

// Inspect ceiling at y=70 inside the house (x: 11..13, z: -24..-22)
let ceilingCovered = 0
for (let x = 11; x <= 13; x++) {
  for (let z = -24; z <= -22; z++) {
    const b = bot.blockAt(new Vec3(x, 70, z))
    if (b && b.name !== 'air') ceilingCovered++
  }
}
console.log(`Ceiling inside covered: ${ceilingCovered}/9 blocks`)

// Check door state
const doorBlock = bot.blockAt(new Vec3(12, 67, -21))
console.log('Door open state:', doorBlock?.getProperties()?.open)

const t = lib.time()
console.log(`TIME: ${t.timeOfDay} (${t.phase}) | night in ${t.secondsUntilNight}s`)

return lib.status()
