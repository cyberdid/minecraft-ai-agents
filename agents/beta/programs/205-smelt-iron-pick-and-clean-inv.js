console.log('=== Clean Inventory, Smelt Iron, Craft Iron Pickaxe ===')

// 1. Enter base if needed
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {}

// 2. Deposit clutter into chest
console.log('Depositing clutter into base chest...')
try {
  await lib.deposit({
    granite: 'all',
    andesite: 'all',
    leather: 'all',
    arrow: 'all',
    bone: 'all',
    bow: 'all',
    oak_sapling: 'all',
    gravel: 'all',
    cooked_beef: 1 // leave 1 cooked beef in chest for Alpha
  })
  console.log('Deposited clutter!')
} catch (e) {
  console.log('Deposit error:', e.message)
}

// 3. Craft planks for fuel
if (lib.count('birch_log') > 0) {
  console.log('Crafting birch_planks...')
  await lib.craft('birch_planks', 4)
}

// 4. Smelt 4 raw iron in furnace
const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock) {
  console.log('Opening furnace to smelt raw iron...')
  const f = await bot.openFurnace(fBlock)
  
  // Take any old output
  if (f.outputItem()) {
    await f.takeOutput()
  }
  
  // Put fuel
  if (lib.count('birch_planks') > 0) {
    await f.putFuel(mcData.itemsByName.birch_planks.id, null, Math.min(lib.count('birch_planks'), 3))
  }
  
  // Put raw iron
  if (lib.count('raw_iron') > 0) {
    await f.putInput(mcData.itemsByName.raw_iron.id, null, Math.min(lib.count('raw_iron'), 4))
  }
  
  f.close()
}

// 5. Wait for 3 iron ingots
console.log('Waiting for 3 iron ingots...')
while (lib.count('iron_ingot') < 3 && !isCancelled()) {
  await sleep(3000)
  if (fBlock) {
    try {
      const f = await bot.openFurnace(fBlock)
      if (f.outputItem()?.name === 'iron_ingot') {
        await f.takeOutput()
      }
      f.close()
    } catch (e) {}
  }
  console.log(`Iron ingots on beta: ${lib.count('iron_ingot')}`)
}

// 6. Craft iron_pickaxe
if (lib.count('iron_ingot') >= 3) {
  console.log('Crafting iron_pickaxe...')
  await lib.craft('iron_pickaxe', 1)
  console.log('Iron pickaxe crafted!')
  bot.chat('Milestone 2 update: Beta crafted an iron_pickaxe! All iron tools ready.')
}

bot.chat('beta: Deposited food and supplies in chest for Alpha. Iron pickaxe ready for diamond mining!')
console.log('Beta tools:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
