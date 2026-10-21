// 058-chop-fuel-and-finish-full-armor.js - chop 4 logs with iron axe, fuel furnace, smelt remaining iron, craft helmet & pickaxe, equip full armor
console.log('Position:', lib.fmt(bot.entity.position))
console.log('Time left in day:', lib.time().secondsUntilNight)

// 1. Step outside door
console.log('Stepping outside door...')
try {
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -52)
  await lib.door(294, 72, -54, false)
} catch (e) {}

// 2. Chop 4 logs
console.log('Chopping 4 logs with iron axe...')
const gotLogs = await lib.collect('*_log', 4)
console.log('Logs collected:', JSON.stringify(gotLogs))

// Craft 16 planks and 8 sticks
const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'))
if (logKey) {
  const plankName = logKey.replace('_log', '_planks')
  await lib.craft(plankName, 16)
  await lib.craft('stick', 8)
}

// 3. Return to base
console.log('Returning inside base...')
await lib.goTo(294, 72, -52, 1)
try {
  await lib.door(294, 72, -54, true)
  await lib.walkTo(294, -56)
  await lib.door(294, 72, -54, false)
} catch (e) {}

// 4. Open furnace at (295, 72, -55) and add fuel
const furnaceBlock = lib.blockAt(295, 72, -55)
const furnace = await bot.openFurnace(furnaceBlock)

// Put planks into slot 1
const fuel = furnace.slots.slice(3).find(i => i && i.name.endsWith('_planks'))
if (fuel) {
  console.log(`Putting ${fuel.count}x fuel into slot 1...`)
  await bot.clickWindow(fuel.slot, 0, 0)
  await bot.clickWindow(1, 0, 0)
  await lib.stowCursor()
}

// Harvest iron ingots
console.log('Harvesting iron ingots...')
let harvested = lib.count('iron_ingot')
for (let i = 0; i < 40; i++) {
  await sleep(1500)
  if (furnace.outputItem() && furnace.outputItem().name === 'iron_ingot') {
    await furnace.takeOutput()
    console.log(`Ingots in inventory now: ${lib.count('iron_ingot')}`)
    if (lib.count('iron_ingot') >= 8) break
  }
  if (!furnace.inputItem() && !furnace.outputItem()) break
}

furnace.close()
console.log('Total iron ingots in inventory:', lib.count('iron_ingot'))

// 5. Craft iron_helmet (5 ingots)
if (lib.count('iron_ingot') >= 5 && lib.count('iron_helmet') === 0) {
  console.log('Crafting iron_helmet...')
  try {
    await lib.craft('iron_helmet', 1)
    console.log('Iron helmet crafted!')
  } catch (e) {
    console.log('Helmet error:', e.message)
  }
}

// 6. Craft fresh iron_pickaxe (3 ingots)
if (lib.count('iron_ingot') >= 3 && lib.count('iron_pickaxe') === 0) {
  console.log('Crafting iron_pickaxe...')
  try {
    await lib.craft('iron_pickaxe', 1)
    console.log('Fresh iron_pickaxe crafted!')
  } catch (e) {
    console.log('Pickaxe error:', e.message)
  }
}

// 7. Equip all armor
const worn = await lib.equipArmor()
console.log('Currently worn armor set:', JSON.stringify(worn))

const fullArmor = worn.head?.includes('iron') && worn.torso?.includes('iron') && worn.legs?.includes('iron') && worn.feet?.includes('iron')
if (fullArmor) {
  bot.chat('beta: Milestone 3 complete! Wearing 100% FULL IRON ARMOR and shield!')
} else {
  bot.chat(`beta: Armor status: ${JSON.stringify(worn)}`)
}

console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

return { worn, fullArmor, tools: lib.tools(), inv: lib.inv(), time: lib.time() }
