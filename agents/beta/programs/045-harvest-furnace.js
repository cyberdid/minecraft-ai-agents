// 045-harvest-furnace.js - harvest furnace output (iron ingots!), cook beef, eat, craft leggings
console.log('Position:', lib.fmt(bot.entity.position))

const furnaceBlock = lib.blockAt(295, 72, -55)
await lib.goNearBlock(295, 72, -55)
const furnace = await bot.openFurnace(furnaceBlock)

console.log('Furnace slots:')
for (let i = 0; i < 3; i++) {
  const item = furnace.slots[i]
  console.log(`Slot ${i}:`, item ? `${item.count}x ${item.name}` : 'empty')
}

// 1. Take output from slot 2
if (furnace.slots[2]) {
  console.log(`Taking ${furnace.slots[2].count}x ${furnace.slots[2].name} from slot 2...`)
  await bot.clickWindow(2, 0, 0)
  await lib.stowCursor()
}

// 2. Take input from slot 0 if not beef
if (furnace.slots[0] && furnace.slots[0].name !== 'beef') {
  console.log(`Taking ${furnace.slots[0].count}x ${furnace.slots[0].name} from slot 0...`)
  await bot.clickWindow(0, 0, 0)
  await lib.stowCursor()
}

// 3. Put 4 beef into slot 0
const beefInWindow = furnace.slots.slice(3).find(i => i && i.name === 'beef')
if (beefInWindow && !furnace.slots[0]) {
  console.log('Putting beef into slot 0...')
  await bot.clickWindow(beefInWindow.slot, 0, 0)
  await bot.clickWindow(0, 0, 0)
  await lib.stowCursor()
}

// 4. Put birch_planks into slot 1 if needed
if (!furnace.slots[1]) {
  const fuelInWindow = furnace.slots.slice(3).find(i => i && i.name.endsWith('_planks'))
  if (fuelInWindow) {
    console.log('Putting fuel into slot 1...')
    await bot.clickWindow(fuelInWindow.slot, 0, 0)
    await bot.clickWindow(1, 0, 0)
    await lib.stowCursor()
  }
}

// Wait for at least 2 beef to cook
console.log('Waiting for beef to cook...')
let cooked = 0
for (let i = 0; i < 30; i++) {
  await sleep(1500)
  const out = furnace.outputItem()
  if (out && out.count >= 2) {
    console.log(`Cooked ${out.count}x ${out.name}! Taking output...`)
    await furnace.takeOutput()
    cooked = out.count
    break
  }
}

furnace.close()
console.log('Closed furnace. Inventory now:', JSON.stringify(lib.inv()))

// Eat cooked food immediately
await lib.eat()
console.log('Food after eating:', bot.food)

// Craft iron_leggings if we have 7 iron ingots!
const ingots = lib.count('iron_ingot')
console.log('Iron ingots count:', ingots)

if (ingots >= 7 && lib.count('iron_leggings') === 0) {
  console.log('Crafting iron_leggings from 7 ingots...')
  try {
    await lib.craft('iron_leggings', 1)
    console.log('Iron leggings crafted!')
    await lib.equipArmor()
    bot.chat('beta: Milestone 3 progress: Crafted and equipped iron leggings!')
  } catch (e) {
    console.log('Leggings craft error:', e.message)
  }
} else if (ingots >= 5 && lib.count('iron_helmet') === 0) {
  console.log('Crafting iron_helmet from 5 ingots...')
  try {
    await lib.craft('iron_helmet', 1)
    await lib.equipArmor()
    bot.chat('beta: Milestone 3 progress: Crafted and equipped iron helmet!')
  } catch (e) {}
}

const worn = await lib.equipArmor()
console.log('Currently worn armor:', JSON.stringify(worn))
console.log('Time left in day:', lib.time().secondsUntilNight)

return { worn, inv: lib.inv(), food: bot.food }
