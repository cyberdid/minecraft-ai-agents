// 056-smelt-helmet-and-dawn.js - smelt iron, craft iron helmet (100% full iron armor!), wait for dawn
console.log('Position inside base:', lib.fmt(bot.entity.position))

const furnaceBlock = lib.blockAt(295, 72, -55)
const furnace = await bot.openFurnace(furnaceBlock)

console.log('Furnace slots:')
for (let i = 0; i < 3; i++) {
  const item = furnace.slots[i]
  console.log(`Slot ${i}:`, item ? `${item.count}x ${item.name}` : 'empty')
}

// 1. Harvest output in slot 2
if (furnace.slots[2]) {
  console.log(`Taking ${furnace.slots[2].count}x ${furnace.slots[2].name} from output...`)
  await bot.clickWindow(2, 0, 0)
  await lib.stowCursor()
}

// 2. Put raw iron into slot 0 if slot 0 is empty
if (!furnace.slots[0]) {
  const raw = furnace.slots.slice(3).find(i => i && i.name === 'raw_iron')
  if (raw) {
    console.log(`Putting ${raw.count}x raw iron into slot 0...`)
    await bot.clickWindow(raw.slot, 0, 0)
    await bot.clickWindow(0, 0, 0)
    await lib.stowCursor()
  }
}

// 3. Check fuel in slot 1
if (!furnace.slots[1]) {
  const fuel = furnace.slots.slice(3).find(i => i && (i.name.endsWith('_planks') || i.name.endsWith('_log')))
  if (fuel) {
    await bot.clickWindow(fuel.slot, 0, 0)
    await bot.clickWindow(1, 0, 0)
    await lib.stowCursor()
  }
}

// 4. Wait for at least 5 ingots
let harvested = 0
for (let i = 0; i < 40; i++) {
  await sleep(1500)
  const out = furnace.outputItem()
  if (out && out.name === 'iron_ingot') {
    harvested += out.count
    console.log(`Harvested ${out.count} ingots (total: ${harvested})...`)
    await furnace.takeOutput()
    if (lib.count('iron_ingot') >= 5) break
  }
  if (!furnace.inputItem()) break
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

// 6. Equip full armor
const worn = await lib.equipArmor()
console.log('Currently worn armor set:', JSON.stringify(worn))

const fullArmor = worn.head?.includes('iron') && worn.torso?.includes('iron') && worn.legs?.includes('iron') && worn.feet?.includes('iron')
if (fullArmor) {
  bot.chat('beta: Milestone 3 achieved! Wearing 100% FULL IRON ARMOR and shield!')
} else {
  bot.chat(`beta: Armor status: ${JSON.stringify(worn)}`)
}

// Wait safely until dawn if night is active
while (!isCancelled()) {
  const t = lib.time()
  console.log(`Tick: ${t.timeOfDay} (${t.phase})`)
  if (t.timeOfDay >= 23460 || t.timeOfDay < 12000) {
    console.log('Dawn reached!')
    bot.chat('beta: Dawn of Day 7 is here! Full iron armor ready for diamond descent.')
    break
  }
  await sleep(10000)
}

return { worn, fullArmor, inv: lib.inv(), time: lib.time() }
