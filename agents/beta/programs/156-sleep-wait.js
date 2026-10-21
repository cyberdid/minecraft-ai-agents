console.log('Sleeping or waiting for morning...')
while (lib.time().night && !isCancelled()) {
  if (bot.isSleeping) {
    console.log('Currently sleeping in bed, time:', lib.time().timeOfDay)
  } else {
    try {
      await lib.sleepInBed()
    } catch (e) {}
  }
  await sleep(2000)
}
console.log('Morning reached! Time:', lib.time())
bot.chat('beta: Morning is here! Ready for day 12.')
return lib.time()
