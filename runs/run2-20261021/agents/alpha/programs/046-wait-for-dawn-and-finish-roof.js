// programs/046-wait-for-dawn-and-finish-roof.js
bot.chat("beta: Safe inside! Waiting out Night 2. At dawn we finish the roof together!")

console.log('Inside house at:', lib.fmt(bot.entity.position))

// 1. Wait out Night 2 until dawn (23460)
while (!isCancelled()) {
  const t = lib.time()
  if (t.timeOfDay >= 23460 || t.timeOfDay < 1000) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}`)
    break
  }
  await sleep(10000)
}

bot.chat("beta: Dawn has arrived! Stepping out to gather final sand for the roof.")

// 2. Open door and step out
console.log('Exiting house through door at (12, 67, -21)...')
const doorBlock = bot.blockAt(new Vec3(12, 67, -21))
if (doorBlock && /door/.test(doorBlock.name) && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock)
  await sleep(300)
}
await lib.walkTo(12.5, -19.5)
console.log('Outside house at:', lib.fmt(bot.entity.position))

// Check hostiles
const h = lib.hostiles(16)
console.log('Hostiles outside at dawn:', h.length)
for (const mob of h) console.log(`- ${mob.name} at ${mob.pos}`)

// 3. Move to quarry at (5, 66, -25) and mine 64 sand
console.log('Moving to quarry at (5, 66, -25)...')
await lib.goTo(5, 66, -25, 2, { dig: true })

const sandBlocks = lib.find('sand', { maxDistance: 12, count: 64 })
  .filter(b => b.position.x <= 7 && b.position.y >= 63)

console.log('Mining sand blocks:', sandBlocks.length)
let mined = 0
for (const b of sandBlocks) {
  if (lib.count('sand') >= 64) break
  try {
    await lib.dig(b.position.x, b.position.y, b.position.z)
    mined++
    if (mined % 6 === 0) await lib.pickup(6)
  } catch (e) {
    console.log('dig err:', e.message)
  }
}
await lib.pickup(8)
console.log(`Mined ${mined} sand. Sand in inventory:`, lib.count('sand'))

// 4. Craft sandstone in batches of 4
await lib.clearCraftingGrid()
await lib.stowCursor()

while (lib.count('sand') >= 4) {
  const batch = Math.min(4, Math.floor(lib.count('sand') / 4))
  if (batch <= 0) break
  try {
    await lib.craft('sandstone', batch)
  } catch (e) {
    console.log('craft err:', e.message)
    await lib.clearCraftingGrid()
    break
  }
}
console.log('Sandstone crafted! Inventory has:', lib.count('sandstone'))

// 5. Return to house and build the roof
console.log('Returning to house at (10, 67, -25)...')
await lib.goTo(10, 67, -25, 2, { dig: true })

function getBlueprint () {
  return lib.shapes.house({
    x: 10, y: 67, z: -25,
    width: 5, depth: 5, height: 3,
    wall: 'sandstone',
    roof: 'sandstone',
    door: 'south',
    windows: true
  })
}

const bp = getBlueprint()
console.log('Materials status before build:', JSON.stringify(lib.materials(bp).need))

const report = await lib.build(bp, { replace: true })
console.log('Build report:', JSON.stringify(report))

const finalMat = lib.materials(bp)
console.log('Materials remaining:', JSON.stringify(finalMat.need))

if (!finalMat.need.sandstone && !finalMat.need.oak_planks) {
  bot.chat("alpha: House at (10, 67, -25) is 100% FINISHED! 5x5 sandstone walls, roof, windows, and oak door!")
} else {
  bot.chat(`alpha: Placed ${report.placed} blocks! Remaining: ${JSON.stringify(finalMat.need)}`)
}

return lib.status()
