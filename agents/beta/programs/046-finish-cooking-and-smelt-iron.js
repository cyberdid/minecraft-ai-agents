// 046-finish-cooking-and-smelt-iron.js - eat to full, cook remaining porkchops, check for alpha's 17 raw iron
console.log('Food before eating:', bot.food)

// 1. Eat cooked beef in hand/inventory
await lib.eat()
await lib.eat()
console.log('Food level after eating:', bot.food)

// 2. Open furnace at (295, 72, -55)
const furnaceBlock = lib.blockAt(295, 72, -55)
const furnace = await bot.openFurnace(furnaceBlock)

console.log('Furnace slots:')
for (let i = 0; i < 3; i++) {
  const item = furnace.slots[i]
  console.log(`Slot ${i}:`, item ? `${item.count}x ${item.name}` : 'empty')
}

// Take any cooked beef in slot 2
if (furnace.slots[2]) {
  await bot.clickWindow(2, 0, 0)
  await lib.stowCursor()
}

// Put 6 porkchops into slot 0 if slot 0 is empty
if (!furnace.slots[0]) {
  const pork = furnace.slots.slice(3).find(i => i && i.name === 'porkchop')
  if (pork) {
    console.log('Putting porkchops into slot 0...')
    await bot.clickWindow(pork.slot, 0, 0)
    await bot.clickWindow(0, 0, 0)
    await lib.stowCursor()
  }
}

// Wait for porkchops to cook
console.log('Waiting for porkchops...')
for (let i = 0; i < 20; i++) {
  await sleep(1500)
  const out = furnace.outputItem()
  if (out && out.count >= 2) {
    console.log(`Cooked ${out.count}x ${out.name}!`)
    await furnace.takeOutput()
    break
  }
}

furnace.close()

// 3. Check chest at (293, 72, -57) for alpha's 17 raw iron
const chest = await lib.chestContents(293, 72, -57)
console.log('Chest contents:', JSON.stringify(chest))

// 4. Check alpha
const alpha = bot.players.alpha
console.log('Alpha entity:', alpha?.entity ? lib.fmt(alpha.entity.position) : 'unknown')

bot.chat('beta: Food cooked, hunger 20/20! Furnace is ready for alpha raw iron.')

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

return { inv: lib.inv(), chest, time: lib.time() }
