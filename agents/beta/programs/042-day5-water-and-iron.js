// 042-day5-water-and-iron.js - Day 5 morning: fill water bucket, cook food, mine iron on east hills for full armor
console.log('Day 5 morning operations starting...')
console.log('Position inside base:', lib.fmt(bot.entity.position))
console.log('Time left in day:', lib.time().secondsUntilNight)

// 1. Step outside base
console.log('Exiting base door...')
try {
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -52)
  await lib.door(294, 72, -54, false)
} catch (e) {
  console.log('Door exit note:', e.message)
}

// 2. Fill water bucket at nearest surface water (Milestone 5)
if (lib.count('bucket') > 0 && lib.count('water_bucket') === 0) {
  console.log('Filling water bucket at nearby water...')
  try {
    const res = await lib.fillBucket('water')
    console.log('Water bucket result:', res)
    bot.chat('beta: Milestone 5 progress: Water bucket filled!')
  } catch (e) {
    console.log('Fill water bucket error:', e.message)
  }
}

// 3. Head to dry east hills (340, 75, -30) to mine iron with iron pickaxe
console.log('Heading to dry east hills (340, 75, -30)...')
try {
  await lib.goTo(340, 75, -30, 4)
  console.log('Arrived at east hills:', lib.fmt(bot.entity.position))
  
  // Find safe surface/hillside iron ore
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32 })
  console.log(`Found ${ores.length} iron ore blocks on east hills`)
  
  let mined = 0
  for (const ore of ores) {
    if (lib.time().secondsUntilNight < 120) {
      console.log('Night approaching in <120s, heading back to base')
      break
    }
    console.log(`Mining iron at ${lib.fmt(ore.position)}...`)
    try {
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true })
      await lib.dig(ore.position.x, ore.position.y, ore.position.z)
      mined++
    } catch (err) {
      console.log('Dig ore note:', err.message)
    }
  }
  await lib.pickup(10)
  console.log(`Mined ${mined} iron ores. Total raw_iron: ${lib.count('raw_iron')}`)
} catch (e) {
  console.log('East hills error:', e.message)
}

// 4. Return to base before nightfall
console.log('Returning to base...')
try {
  await lib.goTo(294, 72, -52, 1)
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -56)
  await lib.door(294, 72, -54, false)
  console.log('Safely back inside base.')
} catch (e) {
  console.log('Return error:', e.message)
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

bot.chat(`beta: Returned to base with ${lib.count('raw_iron')} raw iron and water bucket.`)
return lib.inv()
