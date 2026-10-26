console.log('=== Monitoring Sleep & Dawn ===')
bot.chat('beta: In bed sleeping! Alpha please sleep too to skip the night.')

while (!isCancelled()) {
  const t = lib.time()
  console.log(`t=${t.timeOfDay} (${t.phase}) | isSleeping=${bot.isSleeping} | night in ${t.secondsUntilNight}s`)
  
  if (t.timeOfDay >= 23460 || t.timeOfDay < 1000 || !t.night) {
    console.log('Dawn reached or night skipped!')
    bot.chat('beta: Morning has arrived! Ready for diamonds and obsidian.')
    break
  }
  
  // If not sleeping and can sleep, try sleeping again
  if (!bot.isSleeping && t.canSleep) {
    try {
      await lib.sleepInBed()
    } catch (e) {
      console.log('Sleep retry note:', e.message)
    }
  }
  
  await sleep(10000)
}

console.log('End of sleep watch. Status:', JSON.stringify(lib.status()))
