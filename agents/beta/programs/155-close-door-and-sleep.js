console.log('Ensuring door at (294, 72, -54) is closed...')
try {
  await lib.door(294, 72, -54, false)
} catch (e) {
  console.log('Door note:', e.message)
}

bot.chat('alpha: Base door closed for safety. Night falling in <60s, I am by the beds!')

// Wait until canSleep
while (!lib.time().canSleep && !isCancelled()) {
  await sleep(1000)
}

if (lib.time().canSleep) {
  console.log('Night reached, sleeping in bed...')
  try {
    const res = await lib.sleepInBed()
    console.log('Sleep result:', res)
    bot.chat('beta: In bed sleeping!')
  } catch (e) {
    console.log('Sleep error:', e.message)
  }
}

return lib.time()
