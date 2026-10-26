console.log('=== Fuel Furnace, Dawn Arrival & Iron Pickaxe Craft ===')

// 1. Craft oak_planks from log
if (lib.count('oak_log') > 0) {
  console.log('Crafting oak_planks...')
  await lib.craft('oak_planks', 4)
}

// 2. Put fuel in furnace
const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock) {
  const f = await bot.openFurnace(fBlock)
  console.log('Furnace before fuel:', {
    input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'empty',
    fuel: f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : 'empty',
    output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty'
  })
  if (lib.count('oak_planks') > 0 && !f.fuelItem()) {
    console.log('Adding 4 oak_planks to furnace fuel...')
    await f.putFuel(mcData.itemsByName.oak_planks.id, null, Math.min(lib.count('oak_planks'), 4))
  }
  f.close()
}

// 3. Wait for dawn (23460) and for iron to smelt (~45s)
console.log('Waiting for dawn and smelting...')
while (!isCancelled()) {
  const t = lib.time()
  console.log(`t=${t.timeOfDay} (${t.phase}) | night in ${t.secondsUntilNight}s`)
  if (t.timeOfDay >= 23460 || t.timeOfDay < 1000 || !t.night) {
    console.log('Dawn reached!')
    break
  }
  await sleep(5000)
}

// 4. Collect iron ingots from furnace
await sleep(10000) // let last iron finish
if (fBlock) {
  try {
    const f = await bot.openFurnace(fBlock)
    if (f.outputItem()?.count > 0) {
      console.log(`Taking ${f.outputItem().count} ${f.outputItem().name} from furnace...`)
      await f.takeOutput()
    }
    f.close()
  } catch (e) {
    console.log('Furnace note:', e.message)
  }
}

console.log('Iron ingots on beta:', lib.count('iron_ingot'))

// 5. Craft iron_pickaxe
if (lib.count('iron_ingot') >= 3 && lib.count('iron_pickaxe') === 0) {
  console.log('Crafting iron_pickaxe...')
  await lib.craft('iron_pickaxe', 1)
  console.log('Crafted iron_pickaxe!')
  bot.chat('Milestone 2 update: Beta crafted iron_pickaxe! All iron tools ready.')
}

console.log('Final Gear:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
