console.log('=== Attempting Sleep ===')
const beds = bot.findBlocks({
  matching: b => b && bot.isABed(b),
  maxDistance: 16,
  count: 10
})
console.log('Beds found:', beds.map(p => lib.fmt(p)))

const alpha = bot.players.alpha
console.log('Alpha:', alpha?.entity ? `pos ${lib.fmt(alpha.entity.position)}` : 'no entity')

try {
  console.log('Calling lib.sleepInBed()...')
  const res = await lib.sleepInBed()
  console.log('Sleep result:', res)
  
  // Wait while sleeping or until dawn
  for (let i = 0; i < 30; i++) {
    await sleep(1000)
    const t = lib.time()
    console.log(`Sleeping... t=${t.timeOfDay} (${t.phase}) isSleeping=${bot.isSleeping}`)
    if (t.timeOfDay < 1000 || t.timeOfDay > 23460 || !t.night) {
      console.log('Dawn reached or night skipped!')
      break
    }
    if (!bot.isSleeping) {
      console.log('Woke up!')
      break
    }
  }
} catch (e) {
  console.log('Sleep error:', e.message)
  bot.chat(`beta: Could not sleep: ${e.message}`)
}

console.log('End of sleep script. Time:', JSON.stringify(lib.time()))
