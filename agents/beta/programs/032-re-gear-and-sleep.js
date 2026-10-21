// 032-re-gear-and-sleep.js - withdraw starter tools from chest, close door, wait for 12542 to sleep
bot.chat('beta: Acknowledged alpha! Staying safely inside base. Night in ~90s. Ready to sleep in bed.')

console.log('Position inside base:', lib.fmt(bot.entity.position))
console.log('Time until night:', lib.time().secondsUntilNight)

// Check chest and withdraw items
try {
  const contents = await lib.chestContents(293, 72, -57)
  console.log('Chest contents:', JSON.stringify(contents))
  
  const toWithdraw = {}
  if (contents.stone_pickaxe) toWithdraw.stone_pickaxe = contents.stone_pickaxe
  if (contents.stone_sword) toWithdraw.stone_sword = contents.stone_sword
  if (contents.cooked_mutton) toWithdraw.cooked_mutton = contents.cooked_mutton
  if (contents.cooked_beef) toWithdraw.cooked_beef = contents.cooked_beef
  if (contents.dirt) toWithdraw.dirt = Math.min(contents.dirt, 16)
  if (contents.oak_door) toWithdraw.oak_door = 1
  
  if (Object.keys(toWithdraw).length > 0) {
    console.log('Withdrawing:', JSON.stringify(toWithdraw))
    await lib.withdraw(toWithdraw, 293, 72, -57)
  }
} catch (e) {
  console.log('Chest error:', e.message)
}

// Close base door
console.log('Ensuring door at (294, 72, -54) is closed...')
try {
  await lib.door(294, 72, -54, false)
} catch (e) {
  console.log('Door close note:', e.message)
}

// Wait until canSleep
while (!isCancelled()) {
  const t = lib.time()
  console.log(`Current tick: ${t.timeOfDay} (${t.phase}) | canSleep: ${t.canSleep}`)
  if (t.canSleep) {
    console.log('Can sleep now! Sleeping in bed...')
    bot.chat('beta: In bed now sleeping to skip night! Alpha sleep too.')
    try {
      await lib.sleepInBed()
      console.log('Successfully slept!')
    } catch (e) {
      console.log('Sleep note:', e.message)
    }
    break
  }
  await sleep(4000)
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time after sleep attempt:', lib.time())
return { inv: lib.inv(), time: lib.time() }
