// 049-safe-night-to-day6.js - wait safely inside base during Night 5 until dawn tick 23460, harvest furnace items
bot.chat('beta: Alpha in bed. I am safely inside base guarding until dawn 23460. Ready for Day 6.')

console.log('Position inside base:', lib.fmt(bot.entity.position))
console.log('Waiting out night safely inside base...')

while (!isCancelled()) {
  const t = lib.time()
  console.log(`Tick: ${t.timeOfDay} (${t.phase})`)
  
  if (t.timeOfDay >= 23460 || t.timeOfDay < 12000) {
    console.log('Dawn reached!')
    bot.chat('beta: Dawn of Day 6 has arrived! Starting full armor completion and diamond mining prep.')
    break
  }
  
  // Check furnace output occasionally
  try {
    const fBlock = lib.blockAt(295, 72, -55)
    if (fBlock?.name === 'furnace') {
      const f = await bot.openFurnace(fBlock)
      if (f.outputItem()) {
        console.log(`Harvesting ${f.outputItem().count}x ${f.outputItem().name} from furnace...`)
        await f.takeOutput()
      }
      f.close()
    }
  } catch (fe) {}
  
  await sleep(10000)
}

const hostiles = lib.hostiles(16)
console.log('Hostiles at dawn:', JSON.stringify(hostiles))
return { time: lib.time(), hostiles, inv: lib.inv(), worn: await lib.equipArmor() }
