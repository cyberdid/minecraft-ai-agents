// 033-wait-night-safe.js - wait safely inside base during Night 3 until dawn tick 23460
bot.chat('beta: Only 1 bed in base right now (you are in it). I will watch inside base until dawn 23460, then craft bed 2 and help mine iron.')

console.log('Position inside base:', lib.fmt(bot.entity.position))
console.log('Waiting out night safely inside base...')

while (!isCancelled()) {
  const t = lib.time()
  console.log(`Tick: ${t.timeOfDay} (${t.phase})`)
  
  if (t.timeOfDay >= 23460 || t.timeOfDay < 12000) {
    console.log('Dawn arrived!')
    bot.chat('beta: Dawn is here! Starting Day 4 operations.')
    break
  }
  await sleep(10000)
}

const hostiles = lib.hostiles(16)
console.log('Hostiles at dawn:', JSON.stringify(hostiles))
return { time: lib.time(), hostiles }
