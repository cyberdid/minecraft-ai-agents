// 057-finish-full-armor-and-prep-diamonds.js - harvest furnace ingots, craft iron helmet (100% full armor!), craft iron pickaxe, equip
console.log('Position inside base:', lib.fmt(bot.entity.position))

// 1. Open furnace at (295, 72, -55)
const furnaceBlock = lib.blockAt(295, 72, -55)
const furnace = await bot.openFurnace(furnaceBlock)

console.log('Furnace slots:')
for (let i = 0; i < 3; i++) {
  const item = furnace.slots[i]
  console.log(`Slot ${i}:`, item ? `${item.count}x ${item.name}` : 'empty')
}

// Harvest output slot 2
if (furnace.slots[2]) {
  console.log(`Harvesting ${furnace.slots[2].count}x ${furnace.slots[2].name}...`)
  await bot.clickWindow(2, 0, 0)
  await lib.stowCursor()
}

// If slot 0 is empty, put our raw iron in
if (!furnace.slots[0]) {
  const raw = furnace.slots.slice(3).find(i => i && i.name === 'raw_iron')
  if (raw) {
    console.log(`Putting ${raw.count}x raw iron into furnace...`)
    await bot.clickWindow(raw.slot, 0, 0)
    await bot.clickWindow(0, 0, 0)
    await lib.stowCursor()
  }
}

// Harvest until we have at least 8 ingots
for (let i = 0; i < 30; i++) {
  await sleep(1500)
  if (furnace.outputItem()) {
    await furnace.takeOutput()
  }
  if (lib.count('iron_ingot') >= 8) break
  if (!furnace.inputItem() && !furnace.outputItem()) break
}

furnace.close()
console.log('Total iron ingots in inventory:', lib.count('iron_ingot'))

// 2. Craft iron_helmet (5 ingots)
if (lib.count('iron_ingot') >= 5 && lib.count('iron_helmet') === 0) {
  console.log('Crafting iron_helmet...')
  try {
    await lib.craft('iron_helmet', 1)
    console.log('Iron helmet crafted!')
  } catch (e) {
    console.log('Helmet error:', e.message)
  }
}

// 3. Craft iron_pickaxe (3 ingots)
if (lib.count('iron_ingot') >= 3 && lib.count('iron_pickaxe') === 0) {
  console.log('Crafting iron_pickaxe...')
  try {
    if (lib.count('stick') < 2) {
      // check if we have planks or logs for sticks
      const planks = Object.keys(lib.inv()).find(k => k.endsWith('_planks'))
      if (planks) await lib.craft('stick', 4)
    }
    await lib.craft('iron_pickaxe', 1)
    console.log('Iron pickaxe crafted!')
  } catch (e) {
    console.log('Pickaxe error:', e.message)
  }
}

// 4. Equip all armor
const worn = await lib.equipArmor()
console.log('Currently worn armor set:', JSON.stringify(worn))

const fullArmor = worn.head?.includes('iron') && worn.torso?.includes('iron') && worn.legs?.includes('iron') && worn.feet?.includes('iron')
if (fullArmor) {
  bot.chat('beta: Milestone 3 achieved! Wearing 100% FULL IRON ARMOR and shield!')
} else {
  bot.chat(`beta: Armor status: ${JSON.stringify(worn)}`)
}

console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

return { worn, fullArmor, tools: lib.tools(), inv: lib.inv(), time: lib.time() }
