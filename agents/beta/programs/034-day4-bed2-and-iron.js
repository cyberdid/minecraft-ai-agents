// 034-day4-bed2-and-iron.js - hunt 3 wool for Bed 2, place in base, head to east hills for iron
console.log('Starting Day 4 operations...')
console.log('Position inside base:', lib.fmt(bot.entity.position))
console.log('Time left in day:', lib.time().secondsUntilNight)

// Step outside door
console.log('Exiting door at (294, 72, -54)...')
try {
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -52)
  await lib.door(294, 72, -54, false)
} catch (e) {
  console.log('Door exit note:', e.message)
}

// 1. Collect 4 logs for wood/planks
console.log('Collecting logs for planks/bed...')
try {
  await lib.collect('*_log', 4)
  const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'))
  if (logKey) {
    const plankKey = logKey.replace('_log', '_planks')
    await lib.craft(plankKey, 12)
  }
} catch (e) {
  console.log('Wood collect note:', e.message)
}

// 2. Hunt sheep for 3 wool (heading east towards 320..340, -30)
console.log('Searching for sheep towards east hills (320, 73, -30)...')
try {
  await lib.hunt('sheep', 3)
} catch (e) {
  console.log('Sheep hunt note:', e.message)
}

await lib.pickup(10)
const wool = lib.count('*_wool')
console.log('Wool count:', wool)

// 3. If we have 3 wool, craft Bed 2 and place in base
if (wool >= 3) {
  console.log('Crafting white_bed...')
  try {
    await lib.craft('white_bed', 1)
    
    // Return to base to place Bed 2
    console.log('Returning to base to place Bed 2...')
    await lib.goTo(294, 72, -52, 1)
    await lib.door(294, 72, -54, true)
    await lib.walkTo(294, -56)
    await lib.door(294, 72, -54, false)
    
    // Place Bed 2 at (294, 72, -56)
    await lib.place('white_bed', 294, 72, -56)
    console.log('Bed 2 placed at (294, 72, -56)! Both beds now in base.')
    await lib.setSpawn()
    bot.chat('beta: Bed 2 placed! Milestone 4 fully accomplished for both players.')
  } catch (e) {
    console.log('Bed 2 craft/place note:', e.message)
  }
}

// 4. Head to east hills (340, -30) for dry iron mining
console.log('Heading to dry east hills (340, 75, -30) for iron...')
try {
  await lib.goTo(340, 75, -30, 4)
  console.log('Arrived at east hills:', lib.fmt(bot.entity.position))
  
  // Find safe surface iron ore
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32 })
  console.log(`Found ${ores.length} iron ore blocks on east hills`)
  for (const ore of ores) {
    if (lib.time().secondsUntilNight < 90) break
    console.log(`Mining iron at ${lib.fmt(ore.position)}...`)
    try {
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true })
      await lib.dig(ore.position.x, ore.position.y, ore.position.z)
    } catch (err) {}
  }
  await lib.pickup(10)
} catch (e) {
  console.log('East hills navigation note:', e.message)
}

console.log('Inventory after morning ops:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

bot.chat(`beta: East hills status: have ${lib.count('raw_iron')} raw iron. Heading back to base before dusk.`)
return lib.inv()
