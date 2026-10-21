// 051-place-bed2-and-mine-iron.js - place Bed 2 in base (completing Milestone 4), deposit clutter into chest, join alpha at east hills (340, -30) to mine iron
console.log('Day 6 morning operations starting...')
console.log('Position inside base:', lib.fmt(bot.entity.position))

// 1. Place Bed 2 at (294, 72, -56)
if (lib.count('white_bed') > 0) {
  console.log('Placing Bed 2 at (294, 72, -56)...')
  try {
    await lib.place('white_bed', 294, 72, -56)
    console.log('Bed 2 placed successfully!')
    await lib.setSpawn()
    bot.chat('beta: Milestone 4 complete! Both players have beds placed in base and spawn set.')
  } catch (e) {
    console.log('Bed 2 place error:', e.message)
  }
}

// 2. Put porkchops in furnace to cook with remaining fuel
const furnaceBlock = lib.blockAt(295, 72, -55)
if (furnaceBlock?.name === 'furnace' && lib.count('porkchop') > 0) {
  try {
    const f = await bot.openFurnace(furnaceBlock)
    const pork = f.slots.slice(3).find(i => i && i.name === 'porkchop')
    if (pork && !f.slots[0]) {
      console.log('Putting porkchops into furnace...')
      await bot.clickWindow(pork.slot, 0, 0)
      await bot.clickWindow(0, 0, 0)
      await lib.stowCursor()
    }
    f.close()
  } catch (fe) {
    console.log('Furnace note:', fe.message)
  }
}

// 3. Deposit clutter into chest at (293, 72, -57)
console.log('Depositing building blocks and clutter into chest...')
try {
  await lib.deposit({ cobblestone: 64, granite: 'all', gravel: 'all', oak_door: 'all', diorite: 'all' }, 293, 72, -57)
  console.log('Clutter deposited!')
} catch (de) {
  console.log('Deposit error:', de.message)
}

// 4. Ensure equipped armor & shield
await lib.equipArmor()
await lib.equipWeapon()

// 5. Exit base through door
console.log('Stepping outside door...')
try {
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -52)
  await lib.door(294, 72, -54, false)
} catch (e) {}

bot.chat('beta: Heading to east hills (340, -30) with iron pickaxe to mine remaining iron for full armor.')

// 6. Travel to dry east hills at (340, 75, -30)
console.log('Navigating to dry east hills (340, 75, -30)...')
try {
  await lib.goTo(340, 75, -30, 4)
  console.log('Arrived at east hills:', lib.fmt(bot.entity.position))
  
  // Find safe surface/hill iron ores
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 48 })
  console.log(`Found ${ores.length} iron ores on east hills`)
  
  let mined = 0
  for (const ore of ores) {
    if (lib.time().secondsUntilNight < 120) {
      console.log('Night approaching, returning to base')
      break
    }
    console.log(`Mining iron at ${lib.fmt(ore.position)}...`)
    try {
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true })
      await lib.dig(ore.position.x, ore.position.y, ore.position.z)
      mined++
    } catch (err) {}
  }
  await lib.pickup(12)
  console.log(`Mined ${mined} iron ores. Total raw_iron: ${lib.count('raw_iron')}`)
} catch (ge) {
  console.log('Navigation note:', ge.message)
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

// 7. Return to base before night
console.log('Returning to base...')
try {
  await lib.goTo(294, 72, -52, 1)
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -56)
  await lib.door(294, 72, -54, false)
  console.log('Safely back inside base.')
} catch (e) {}

bot.chat(`beta: Returned to base with ${lib.count('raw_iron')} raw iron. Ready to craft full armor.`)
return lib.inv()
