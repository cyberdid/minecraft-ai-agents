console.log('Crafting birch planks...')
if (lib.count('birch_log') > 0) {
  await lib.craft('birch_planks', 4)
}

console.log('Depositing 10 planks into chest...')
await lib.deposit({ oak_planks: 10 })

// Find Alpha
const alpha = Object.values(bot.entities).find(e => e.username === 'alpha')
if (alpha) {
  console.log(`Alpha is at: (${alpha.position.x.toFixed(1)}, ${alpha.position.y.toFixed(1)}, ${alpha.position.z.toFixed(1)}) dist: ${bot.entity.position.distanceTo(alpha.position).toFixed(1)}`)
} else {
  console.log('Alpha is outside/approaching base')
}

bot.chat('alpha: 10 oak planks in chest for fuel! Night in ~70s, let us sleep in beds to skip night!')

// Close base door if open
const doorPos = new Vec3(294, 72, -54)
const doorBlock = bot.blockAt(doorPos)
console.log('Door at (294, 72, -54):', doorBlock ? doorBlock.name : 'null')

// Check if can sleep
const time = lib.time()
console.log('Time info:', time)
if (time.canSleep) {
  console.log('Attempting sleep...')
  try {
    await lib.sleepInBed()
    console.log('Sleeping in bed!')
  } catch (e) {
    console.log('Sleep note:', e.message)
  }
}

return { time: lib.time(), inv: lib.inv() }
