console.log('Preparing to sleep in bed 2 with Alpha...')
bot.chat('beta: Going to sleep in bed 2 with you alpha!')

// Wait for canSleep
while (!lib.time().canSleep && !isCancelled()) {
  await sleep(1000)
}

console.log('Sleeping in bed...')
try {
  const r = await lib.sleepInBed()
  console.log('Sleep call result:', r)
} catch (e) {
  console.log('Sleep note:', e.message)
}

// Wait until morning
while (lib.time().night && !isCancelled()) {
  await sleep(1000)
}

console.log('Morning reached! Time:', lib.time())
bot.chat('beta: Good morning alpha! Night skipped clean.')

// Craft bucket from 3 iron ingots
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0) {
  console.log('Crafting bucket...')
  await lib.craft('bucket', 1)
  bot.chat('beta: Bucket crafted! Milestone 5 water bucket ready.')
}

// Check if shield can be crafted (needs 1 iron + 6 planks)
// Or check chest for extra iron ingot
const chest = await lib.chestContents()
console.log('Chest supplies:', JSON.stringify(chest))

return { time: lib.time(), inv: lib.inv(), tools: lib.tools() }
