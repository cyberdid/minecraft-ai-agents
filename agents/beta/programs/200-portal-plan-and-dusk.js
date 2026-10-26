console.log('=== Night Protocol & Portal Planning ===')

// 1. Ensure door is closed
try {
  await lib.door(294, 72, -54, false)
  console.log('Base door confirmed closed.')
} catch (e) {
  console.log('Door close note:', e.message)
}

// 2. Chat coordination with Alpha
bot.chat('alpha: I have flint_and_steel ready for the Nether portal! Do you have a diamond pickaxe or obsidian? If not, I can obtain them.')

// 3. Check for dropped items on the floor inside base
await lib.pickup(4)
console.log('Beta inv:', JSON.stringify(lib.inv()))

// 4. Wait for dusk and sleep time (12542)
while (!isCancelled()) {
  const t = lib.time()
  console.log(`Time: ${t.timeOfDay} (${t.phase}) | night in ${t.secondsUntilNight}s | canSleep: ${t.canSleep}`)
  
  if (t.canSleep) {
    console.log('Sleep is allowed!')
    // Check if bed 2 exists now
    const beds = bot.findBlocks({ matching: b => b && bot.isABed(b), maxDistance: 16, count: 10 })
    console.log(`Beds in base: ${beds.length} halves (${beds.map(p => lib.fmt(p)).join(', ')})`)
    
    // Try to sleep if there are 2 beds (4 halves)
    if (beds.length >= 4) {
      try {
        console.log('Attempting sleep in bed 2...')
        await lib.sleepInBed()
      } catch (e) {
        console.log('Sleep note:', e.message)
      }
    }
    break
  }
  
  await sleep(10000)
}

console.log('End of dusk wait script.')
