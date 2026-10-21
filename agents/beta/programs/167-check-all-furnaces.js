const furnaces = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
]

for (let i = 0; i < furnaces.length; i++) {
  const p = furnaces[i]
  const b = bot.blockAt(p)
  if (!b) continue
  const f = await bot.openFurnace(b)
  console.log(`Furnace ${i+1} at (${p.x},${p.y},${p.z}):`, {
    input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'empty',
    fuel: f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : 'empty',
    output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty',
    progress: f.progress
  })
  if (f.outputItem()?.count > 0) {
    console.log(`Taking ${f.outputItem().count} output from Furnace ${i+1}...`)
    await f.takeOutput()
  }
  // If furnace has input but no fuel, add planks
  if (f.inputItem() && !f.fuelItem()) {
    console.log(`Furnace ${i+1} needs fuel!`)
    if (lib.count('birch_planks') > 0) {
      await f.putFuel(mcData.itemsByName.birch_planks.id, null, Math.min(lib.count('birch_planks'), 4))
    }
  }
  f.close()
}

console.log('Total iron ingots on beta now:', lib.count('iron_ingot'))

if (lib.count('iron_ingot') >= 4 && lib.count('iron_boots') === 0) {
  console.log('Crafting iron_boots...')
  await lib.craft('iron_boots', 1)
  await lib.equipArmor()
  bot.chat('Milestone 3 COMPLETE: Full iron armor equipped for both players!')
}

console.log('Beta gear:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
return { inv: lib.inv(), tools: lib.tools() }
