console.log('=== Night Watch in Base ===')
bot.chat('beta: Sheltered in base with Alpha. Waiting for dawn (tick 23460).')

while (!isCancelled()) {
  const t = lib.time()
  const hostiles = lib.hostiles(16)
  
  if (t.timeOfDay >= 23460 || t.timeOfDay < 1000 || !t.night) {
    console.log(`Dawn reached! timeOfDay=${t.timeOfDay}, phase=${t.phase}`)
    bot.chat('beta: Dawn has arrived! Safe to exit base.')
    break
  }
  
  console.log(`t=${t.timeOfDay} (${t.phase}) | night in ${t.secondsUntilNight}s | hostiles: ${hostiles.length}`)
  
  // Make sure door is closed
  try {
    const doorBlock = bot.blockAt(new Vec3(294, 72, -54))
    if (doorBlock && doorBlock.name === 'oak_door') {
      await lib.door(294, 72, -54, false)
    }
  } catch (e) {}

  await sleep(15000)
}
