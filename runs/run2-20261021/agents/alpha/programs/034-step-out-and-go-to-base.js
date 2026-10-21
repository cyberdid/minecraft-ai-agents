// programs/034-step-out-and-go-to-base.js
console.log('alpha at:', lib.fmt(bot.entity.position))

// Dig the sand block to the West at (31, 64, -45) and (31, 63, -45) to create stairs/walkway
const bWestUpper = bot.blockAt(new Vec3(31, 64, -45))
if (bWestUpper && bWestUpper.name !== 'air') {
  console.log(`Digging west upper ${bWestUpper.name}...`)
  await bot.dig(bWestUpper, true)
}

const bWestLower = bot.blockAt(new Vec3(31, 63, -45))
if (bWestLower && bWestLower.name !== 'air') {
  console.log(`Digging west lower ${bWestLower.name}...`)
  await bot.dig(bWestLower, true)
}

// Walk west towards base
console.log('Stepping out towards West...')
await lib.walkTo(30, -45)
console.log('Position after step out:', lib.fmt(bot.entity.position))

// Check creeper
const h = lib.hostiles(16)
console.log('Hostiles near:', h.length)
for (const mob of h) {
  console.log(`- ${mob.name} at ${mob.pos} dist: ${mob.dist}`)
}

// Now navigate to base (10, 67, -25)
console.log('Navigating to base (10, 67, -25)...')
await lib.goTo(10, 67, -25, 2, { dig: true })
console.log('Arrived at base:', lib.fmt(bot.entity.position))

return lib.status()
