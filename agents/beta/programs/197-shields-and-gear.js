console.log('=== Crafting Shields & Iron Gear ===')

// 1. Check furnace for smelted iron
const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock) {
  try {
    const f = await bot.openFurnace(fBlock)
    if (f.outputItem()?.name === 'iron_ingot') {
      console.log(`Taking ${f.outputItem().count} iron ingots from furnace...`)
      await f.takeOutput()
    }
    // If furnace has remaining raw_iron in inventory, put it in
    if (lib.count('raw_iron') > 0 && f.inputItem() === null) {
      await f.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'))
    }
    f.close()
  } catch (e) {
    console.log('Furnace check note:', e.message)
  }
}
console.log('Iron ingots on beta:', lib.count('iron_ingot'))

// 2. Step outside and chop 4 logs
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {}

console.log('Collecting logs for planks...')
try {
  await bot.equip(mcData.itemsByName.stone_axe.id, 'hand')
  await lib.collect('*_log', 4)
  console.log('Logs collected! Logs count:', lib.count('*_log'))
} catch (e) {
  console.log('Log collect error:', e.message)
}

// 3. Return into base
try {
  await lib.goTo(294, 72, -53, 1)
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {}

// 4. Check furnace again
if (fBlock) {
  try {
    const f = await bot.openFurnace(fBlock)
    if (f.outputItem()?.name === 'iron_ingot') {
      await f.takeOutput()
    }
    f.close()
  } catch (e) {}
}
console.log('Iron ingots on beta now:', lib.count('iron_ingot'))

// 5. Craft planks
if (lib.count('*_log') > 0) {
  const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'))
  const plankName = logName.replace('_log', '_planks')
  console.log(`Crafting ${plankName}...`)
  await lib.craft(plankName, lib.count(logName) * 4)
}

// 6. Craft shields and equip
if (lib.count('*_planks') >= 6 && lib.count('iron_ingot') >= 1 && lib.count('shield') === 0) {
  console.log('Crafting shield for Beta...')
  await lib.craft('shield', 1)
  await lib.equipArmor()
  console.log('Equipped shield in off-hand!')
  bot.chat('Milestone 3 COMPLETE: Full iron armor and shield equipped on Beta!')
}

// 7. Craft gear for Alpha if materials permit
if (lib.count('*_planks') >= 6 && lib.count('iron_ingot') >= 1) {
  console.log('Crafting shield for Alpha...')
  try {
    await lib.craft('shield', 1)
    await lib.deposit({ shield: 1 })
    bot.chat('beta: Deposited shield for Alpha in the base chest!')
  } catch (e) {
    console.log('Alpha shield note:', e.message)
  }
}

if (lib.count('iron_ingot') >= 3) {
  console.log('Crafting bucket for Alpha...')
  try {
    await lib.craft('bucket', 1)
    await lib.deposit({ bucket: 1 })
    bot.chat('beta: Deposited bucket for Alpha in the base chest!')
  } catch (e) {
    console.log('Alpha bucket note:', e.message)
  }
}

console.log('Final Gear:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
