console.log('Stepping into shaft at (345.5, 62, -32.5)...')
await bot.lookAt(new Vec3(345.5, 62, -32.5), true)
bot.setControlState('forward', true)
await sleep(300)
bot.setControlState('forward', false)

console.log('Position before tower:', bot.entity.position)

// Tower up to y=75
await bot.equip(mcData.itemsByName.dirt.id, 'hand')
for (let y = Math.floor(bot.entity.position.y); y < 75; y++) {
  bot.setControlState('jump', true)
  await sleep(150)
  const belowPos = bot.entity.position.floored().offset(0, -1, 0)
  try {
    const block = bot.blockAt(belowPos)
    if (block && block.name === 'air') {
      await bot.placeBlock(bot.blockAt(belowPos.offset(0, -1, 0)), new Vec3(0, 1, 0))
    }
  } catch (e) {}
  await sleep(150)
  bot.setControlState('jump', false)
  await sleep(100)
}

console.log('Reached surface at:', bot.entity.position)

// Path to base door
bot.chat('beta: Surface reached! Running to base bed.')
try {
  await lib.goTo(294, 72, -54, 2)
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {
  console.log('Go to base note:', e.message)
}

// Sleep in bed
console.log('Sleeping in bed...')
try {
  await lib.sleepInBed()
  console.log('Sleeping now!')
} catch (e) {
  console.log('Sleep note:', e.message)
}

return { pos: bot.entity.position, time: lib.time() }
