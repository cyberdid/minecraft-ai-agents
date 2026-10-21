// 037-inspect-furnace-and-alpha.js - empty furnace at (295, 72, -55), cook meat, eat, coordinate iron
const furnaceBlock = lib.blockAt(295, 72, -55)
console.log('Furnace block:', furnaceBlock?.name)

// Open furnace and inspect slots
const furnace = await bot.openFurnace(furnaceBlock)
console.log('Furnace input item:', furnace.inputItem()?.name, furnace.inputItem()?.count)
console.log('Furnace fuel item:', furnace.fuelItem()?.name, furnace.fuelItem()?.count)
console.log('Furnace output item:', furnace.outputItem()?.name, furnace.outputItem()?.count)

// Take output item if any
if (furnace.outputItem()) {
  console.log(`Taking ${furnace.outputItem().count}x ${furnace.outputItem().name} from furnace output...`)
  await furnace.takeOutput()
}

// Take input item if finished or stuck
if (furnace.inputItem()) {
  await furnace.takeInput()
}

furnace.close()

console.log('Inventory after clearing furnace:', JSON.stringify(lib.inv()))

// Now smelt 6 beef in furnace
const beef = lib.count('beef')
if (beef > 0 && lib.count('*_planks') >= 2) {
  console.log(`Smelting ${beef} beef...`)
  try {
    await lib.smelt('beef', 'birch_planks', beef)
    console.log('Beef smelted! cooked_beef count:', lib.count('cooked_beef'))
  } catch (e) {
    console.log('Beef smelt error:', e.message)
  }
}

// Eat cooked food
await lib.eat()
console.log('Food level now:', bot.food)

bot.chat('beta: Furnace cleared and food cooked! Alpha, did you mine iron on east hills?')

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)
return lib.inv()
