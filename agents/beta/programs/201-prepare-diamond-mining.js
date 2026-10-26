console.log('=== Preparing for Diamond Mining ===')

// 1. Check furnace for iron ingots
const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock) {
  try {
    const f = await bot.openFurnace(fBlock)
    console.log('Furnace state:', {
      input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'empty',
      fuel: f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : 'empty',
      output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty'
    })
    if (f.outputItem()?.count > 0) {
      console.log(`Taking ${f.outputItem().count} output...`)
      await f.takeOutput()
    }
    f.close()
  } catch (e) {
    console.log('Furnace error:', e.message)
  }
}

console.log('Iron ingots on beta:', lib.count('iron_ingot'))

// 2. Craft sticks if needed
if (lib.count('stick') < 8 && lib.count('*_planks') >= 4) {
  await lib.craft('stick', 8)
} else if (lib.count('stick') < 8 && lib.count('*_log') > 0) {
  await lib.craft('oak_planks', 4)
  await lib.craft('stick', 8)
}

// 3. Craft iron_pickaxe
if (lib.count('iron_ingot') >= 3 && lib.count('iron_pickaxe') === 0) {
  console.log('Crafting iron_pickaxe...')
  await lib.craft('iron_pickaxe', 1)
  console.log('Crafted iron_pickaxe!')
}

// 4. Craft 3 spare stone_pickaxe
const needStonePicks = Math.max(0, 3 - lib.count('stone_pickaxe'))
if (needStonePicks > 0 && lib.count('cobblestone') >= needStonePicks * 3 && lib.count('stick') >= needStonePicks * 2) {
  console.log(`Crafting ${needStonePicks} stone_pickaxes...`)
  await lib.craft('stone_pickaxe', needStonePicks)
}

// 5. Try sleeping in bed
try {
  console.log('Testing sleep...')
  await lib.sleepInBed()
  console.log('Sleeping!')
} catch (e) {
  console.log('Sleep note:', e.message)
}

bot.chat('beta: Prepared iron pickaxe and spare pickaxes. Ready for diamond mining at dawn!')
console.log('Beta Gear:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
