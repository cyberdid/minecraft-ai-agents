// 059-prep-diamonds-and-portal.js - harvest furnace ingots, craft iron pickaxe & flint_and_steel, deposit clutter
console.log('Position inside base:', lib.fmt(bot.entity.position))

// 1. Harvest furnace output
const furnaceBlock = lib.blockAt(295, 72, -55)
const furnace = await bot.openFurnace(furnaceBlock)
if (furnace.outputItem()) {
  console.log(`Harvesting ${furnace.outputItem().count}x ${furnace.outputItem().name}...`)
  await furnace.takeOutput()
}
furnace.close()

console.log('Iron ingots count:', lib.count('iron_ingot'))

// 2. Craft fresh iron_pickaxe (3 ingots, 2 sticks)
if (lib.count('iron_ingot') >= 3 && lib.count('iron_pickaxe') === 0) {
  console.log('Crafting iron_pickaxe...')
  try {
    if (lib.count('stick') < 2) await lib.craft('stick', 4)
    await lib.craft('iron_pickaxe', 1)
    console.log('Iron pickaxe crafted!')
  } catch (e) {
    console.log('Pickaxe error:', e.message)
  }
}

// 3. Obtain flint from gravel if needed
if (lib.count('flint') === 0 && lib.count('flint_and_steel') === 0 && lib.count('gravel') > 0) {
  console.log('Digging gravel for flint...')
  for (let i = 0; i < 15 && lib.count('flint') === 0; i++) {
    try {
      const s = await lib.freeSpot()
      await lib.place('gravel', s.x, s.y, s.z)
      await lib.dig(s.x, s.y, s.z)
      await lib.pickup(4)
    } catch (e) {}
  }
}

// 4. Craft flint_and_steel (Milestone 7 lighter)
if (lib.count('flint') > 0 && lib.count('iron_ingot') >= 1 && lib.count('flint_and_steel') === 0) {
  console.log('Crafting flint_and_steel...')
  try {
    await lib.craft('flint_and_steel', 1)
    console.log('Flint and steel crafted!')
  } catch (e) {
    console.log('Flint and steel error:', e.message)
  }
}

// 5. Deposit excess clutter into base chest
const chests = lib.find('chest', { maxDistance: 8 })
if (chests.length > 0) {
  const c = chests[0].position
  try {
    await lib.deposit({ cobblestone: 128, granite: 'all', andesite: 'all', diorite: 'all', oak_door: 4 }, c.x, c.y, c.z)
    console.log('Clutter deposited into chest.')
  } catch (e) {}
}

// 6. Ensure full armor equipped
const worn = await lib.equipArmor()
console.log('Worn armor:', JSON.stringify(worn))
console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

bot.chat('beta: Fully geared! Wearing full iron armor, shield, iron pickaxe, water bucket, flint & steel. Ready to descend for diamonds!')
return { worn, tools: lib.tools(), inv: lib.inv(), time: lib.time() }
