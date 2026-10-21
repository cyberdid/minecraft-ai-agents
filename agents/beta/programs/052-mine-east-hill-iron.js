// 052-mine-east-hill-iron.js - deposit clutter, harvest cooked food, mine iron on east hills, craft leggings & helmet
console.log('Position:', lib.fmt(bot.entity.position))
console.log('Time left in day:', lib.time().secondsUntilNight)

// 1. Locate chest in base
const chests = lib.find('chest', { maxDistance: 8 })
console.log('Chests found:', chests.map(c => lib.fmt(c.position)).join(', '))
if (chests.length > 0) {
  const cPos = chests[0].position
  console.log(`Depositing clutter into chest at ${lib.fmt(cPos)}...`)
  try {
    await lib.deposit({ cobblestone: 64, granite: 'all', gravel: 'all', oak_door: 4, andesite: 'all', diorite: 'all', egg: 'all' }, cPos.x, cPos.y, cPos.z)
    console.log('Clutter deposited successfully!')
  } catch (de) {
    console.log('Deposit error:', de.message)
  }
}

// 2. Check furnace for cooked porkchops
const furnaceBlock = lib.blockAt(295, 72, -55)
if (furnaceBlock?.name === 'furnace') {
  try {
    const f = await bot.openFurnace(furnaceBlock)
    if (f.outputItem()) {
      console.log(`Taking ${f.outputItem().count}x ${f.outputItem().name} from furnace...`)
      await f.takeOutput()
    }
    f.close()
  } catch (fe) {
    console.log('Furnace error:', fe.message)
  }
}

// 3. Step outside base
console.log('Stepping outside door...')
try {
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -52)
  await lib.door(294, 72, -54, false)
} catch (e) {}

bot.chat('beta: Mining iron on east hills (340, -30) to finish full iron armor.')

// 4. Navigate to east hills (340, 75, -30)
console.log('Navigating to east hills (340, 75, -30)...')
try {
  await lib.goTo(340, 75, -30, 4)
  console.log('Arrived at east hills:', lib.fmt(bot.entity.position))
  
  // Search for iron ores within 64 blocks
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 64, count: 25 })
  console.log(`Found ${ores.length} iron ore blocks on east hills`)
  
  let mined = 0
  for (const ore of ores) {
    if (lib.time().secondsUntilNight < 120 || lib.count('raw_iron') >= 15) {
      console.log('Goal reached or night approaching, stopping mining')
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
  console.log(`Mined ${mined} iron ores. Total raw_iron in inventory: ${lib.count('raw_iron')}`)
} catch (e) {
  console.log('East hills navigation note:', e.message)
}

// 5. Return to base before dusk
console.log('Returning to base at (294, 72, -52)...')
try {
  await lib.goTo(294, 72, -52, 1)
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -56)
  await lib.door(294, 72, -54, false)
  console.log('Safely back inside base.')
} catch (e) {}

// 6. Smelt raw iron if we have at least 5
const rawCount = lib.count('raw_iron')
if (rawCount >= 5 && furnaceBlock?.name === 'furnace') {
  console.log(`Smelting ${rawCount} raw iron...`)
  try {
    const f = await bot.openFurnace(furnaceBlock)
    const rawInWindow = f.slots.slice(3).find(i => i && i.name === 'raw_iron')
    if (rawInWindow && !f.slots[0]) {
      await bot.clickWindow(rawInWindow.slot, 0, 0)
      await bot.clickWindow(0, 0, 0)
      await lib.stowCursor()
    }
    // Check fuel
    if (!f.slots[1]) {
      const fuelInWindow = f.slots.slice(3).find(i => i && (i.name.endsWith('_planks') || i.name.endsWith('_log')))
      if (fuelInWindow) {
        await bot.clickWindow(fuelInWindow.slot, 0, 0)
        await bot.clickWindow(1, 0, 0)
        await lib.stowCursor()
      }
    }
    // Harvest ingots
    for (let i = 0; i < 25; i++) {
      await sleep(1500)
      if (f.outputItem()) await f.takeOutput()
      if (lib.count('iron_ingot') >= 12 || !f.inputItem()) break
    }
    f.close()
  } catch (fe) {
    console.log('Furnace smelting error:', fe.message)
  }
}

// 7. Craft remaining armor
const ingots = lib.count('iron_ingot')
console.log('Iron ingots available:', ingots)

if (ingots >= 7 && lib.count('iron_leggings') === 0) {
  console.log('Crafting iron_leggings...')
  try { await lib.craft('iron_leggings', 1) } catch (e) {}
}

if (lib.count('iron_ingot') >= 5 && lib.count('iron_helmet') === 0) {
  console.log('Crafting iron_helmet...')
  try { await lib.craft('iron_helmet', 1) } catch (e) {}
}

const worn = await lib.equipArmor()
console.log('Currently worn armor:', JSON.stringify(worn))

const fullArmor = worn.head?.includes('iron') && worn.torso?.includes('iron') && worn.legs?.includes('iron') && worn.feet?.includes('iron')
if (fullArmor) {
  bot.chat('beta: Milestone 3 achieved! FULL IRON ARMOR equipped!')
} else {
  bot.chat(`beta: Armor status: ${JSON.stringify(worn)}`)
}

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

return { worn, fullArmor, inv: lib.inv(), time: lib.time() }
