// 012-wait-until-dawn.js - wait inside base until morning (23460), keep watch
bot.chat('beta: Waiting out Night 1 inside base. Preparing for morning.')

// Craft some sticks from planks so we are ready for torches
if (lib.count('stick') < 16 && lib.count('*_planks') >= 4) {
  await lib.craft('stick', 16)
}

console.log('Inventory:', JSON.stringify(lib.inv()))

while (!isCancelled()) {
  const t = lib.time()
  console.log(`Time: ${t.timeOfDay} (${t.phase})`)
  
  // Dawn check: 23460..24000 or early morning 0..12000
  if (t.timeOfDay >= 23460 || t.timeOfDay < 12000) {
    console.log('Dawn has arrived! Safe to proceed.')
    bot.chat('beta: Dawn is here! Starting morning operations.')
    break
  }
  
  await sleep(10000)
}

const hostiles = lib.hostiles(16)
console.log('Hostiles near base at dawn:', JSON.stringify(hostiles))
return { time: lib.time(), hostiles }
