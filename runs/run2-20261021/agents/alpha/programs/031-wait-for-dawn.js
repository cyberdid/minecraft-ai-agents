// programs/031-wait-for-dawn.js
console.log('Sheltered at (32, 63, -45). Waiting for dawn...')

while (!isCancelled()) {
  const t = lib.time()
  if (t.timeOfDay >= 23460 || t.timeOfDay < 1000) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}`)
    break
  }
  await sleep(10000)
}

bot.chat("beta: Dawn has arrived! Exiting shelter to build at (10, 67, -25).")

// Check hostiles outside
const h = lib.hostiles(12)
console.log('Hostiles near shelter at dawn:', h.length)
for (const mob of h) {
  console.log(`- ${mob.name} at ${mob.pos}`)
}

// Dig the roof at (32, 65, -45)
const roofPos = new Vec3(32, 65, -45)
const roofBlock = bot.blockAt(roofPos)
if (roofBlock && roofBlock.name !== 'air') {
  console.log(`Digging roof block ${roofBlock.name}...`)
  await bot.dig(roofBlock, true)
}

// Climb up
console.log('Climbing out of shelter...')
try {
  await lib.goTo(32, 65, -45, 1)
} catch (e) {
  console.log('step out warning:', e.message)
}

// Pickup items (including stone tools tossed by beta)
const picked = await lib.pickup(10)
console.log('Picked up at dawn:', picked)
console.log('Inventory at dawn:', JSON.stringify(lib.inv()))

return lib.status()
