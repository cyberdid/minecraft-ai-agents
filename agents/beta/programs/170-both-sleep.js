console.log('Sleeping in bed 2 at (293, 72, -56)...')
bot.chat('beta: In bed 2! Sleep in bed 1 alpha to skip to dawn!')

try {
  const r = await lib.sleepInBed()
  console.log('Sleep result:', r)
} catch (e) {
  console.log('Sleep note:', e.message)
}

// Wait up to 10s to see if night skips
for (let i = 0; i < 5; i++) {
  await sleep(2000)
  if (!lib.time().night) {
    console.log('NIGHT SKIPPED TO DAWN! Time:', lib.time())
    bot.chat('beta: Dawn is here! Night skipped.')
    break
  }
}

return lib.time()
