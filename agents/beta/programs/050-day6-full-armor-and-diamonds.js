// 050-day6-full-armor-and-diamonds.js - Day 6: complete full iron armor, cook porkchops, prep for diamond mining
console.log('Day 6 morning operations starting...')
console.log('Position inside base:', lib.fmt(bot.entity.position))
console.log('Time left in day:', lib.time().secondsUntilNight)

// 1. Check furnace at (295, 72, -55) and harvest any ingots / cooked items
const furnaceBlock = lib.blockAt(295, 72, -55)
if (furnaceBlock?.name === 'furnace') {
  const f = await bot.openFurnace(furnaceBlock)
  if (f.outputItem()) {
    console.log(`Harvesting ${f.outputItem().count}x ${f.outputItem().name} from furnace...`)
    await f.takeOutput()
  }
  // Cook porkchops if any
  const pork = f.slots.slice(3).find(i => i && i.name === 'porkchop')
  if (pork && !f.slots[0]) {
    await bot.clickWindow(pork.slot, 0, 0)
    await bot.clickWindow(0, 0, 0)
    await lib.stowCursor()
  }
  f.close()
}

// 2. Check chest at (293, 72, -57) for any iron ingots from alpha
const chest = await lib.chestContents(293, 72, -57)
console.log('Chest contents:', JSON.stringify(chest))
if (chest.iron_ingot > 0) {
  console.log(`Withdrawing ${chest.iron_ingot} iron ingots from chest...`)
  await lib.withdraw({ iron_ingot: chest.iron_ingot }, 293, 72, -57)
}

const ingots = lib.count('iron_ingot')
console.log('Total iron ingots available:', ingots)

// 3. Craft iron_leggings (7 ingots)
if (ingots >= 7 && lib.count('iron_leggings') === 0) {
  console.log('Crafting iron_leggings...')
  try {
    await lib.craft('iron_leggings', 1)
    console.log('Iron leggings crafted!')
  } catch (e) {
    console.log('Leggings error:', e.message)
  }
}

// 4. Craft iron_helmet (5 ingots)
if (lib.count('iron_ingot') >= 5 && lib.count('iron_helmet') === 0) {
  console.log('Crafting iron_helmet...')
  try {
    await lib.craft('iron_helmet', 1)
    console.log('Iron helmet crafted!')
  } catch (e) {
    console.log('Helmet error:', e.message)
  }
}

// 5. Equip all armor pieces
const worn = await lib.equipArmor()
console.log('Currently worn armor set:', JSON.stringify(worn))

// Check if full iron armor is worn
const isFullArmor = worn.head?.includes('iron') && worn.torso?.includes('iron') && worn.legs?.includes('iron') && worn.feet?.includes('iron')
if (isFullArmor) {
  bot.chat('beta: Milestone 3 achieved! Wearing FULL IRON ARMOR and shield!')
} else {
  bot.chat(`beta: Armor status: ${JSON.stringify(worn)}`)
}

console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

return { worn, inv: lib.inv(), time: lib.time(), fullArmor: isFullArmor }
