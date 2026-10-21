// programs/045-enter-and-close.js
console.log('alpha at:', lib.fmt(bot.entity.position))

// Check block at (12, 67, -21)
const d1 = bot.blockAt(new Vec3(12, 67, -21))
console.log('Block at (12, 67, -21):', d1?.name, 'open:', d1?.getProperties()?.open)

// If it is a door and closed, open it
if (d1 && /door/.test(d1.name)) {
  if (!d1.getProperties().open) {
    console.log('Opening door...')
    await bot.activateBlock(d1)
    await sleep(250)
  }
}

// Walk inside to (12.5, -23.5)
console.log('Walking inside house to (12.5, -23.5)...')
await lib.walkTo(12.5, -23.5)
console.log('Position inside:', lib.fmt(bot.entity.position))

// Now close door at (12, 67, -21)
const dNow = bot.blockAt(new Vec3(12, 67, -21))
if (dNow && /door/.test(dNow.name) && dNow.getProperties().open) {
  console.log('Closing door...')
  await bot.activateBlock(dNow)
  await sleep(250)
}

// Check beta position
const beta = bot.players.beta?.entity
console.log('Beta pos:', beta ? lib.fmt(beta.position) : 'unknown')

const t = lib.time()
console.log(`TIME: ${t.timeOfDay} (${t.phase}) | night in ${t.secondsUntilNight}s`)

bot.chat("beta: I'm inside the house with you! Door closed. Safe for Night 2!")

return lib.status()
