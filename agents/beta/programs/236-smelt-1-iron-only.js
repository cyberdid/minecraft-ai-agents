console.log('=== Smelt 1 Iron Ingot & Craft Bucket ===')

const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock) {
  const f = await bot.openFurnace(fBlock)
  console.log('Furnace before:', {
    input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'empty',
    fuel: f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : 'empty',
    output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty'
  })
  
  // If output is already there, take it
  if (f.outputItem()) {
    console.log(`Taking ${f.outputItem().count} ${f.outputItem().name}...`)
    await f.takeOutput()
  }
  
  // Put 1 raw iron into input
  if (lib.count('raw_iron') > 0 && !f.inputItem()) {
    console.log('Putting 1 raw_iron into input slot...')
    await f.putInput(mcData.itemsByName.raw_iron.id, null, 1)
  }
  
  f.close()
}

// Wait for smelting
console.log('Waiting 12s for smelting...')
await sleep(12000)

// Take output
if (fBlock) {
  const f2 = await bot.openFurnace(fBlock)
  if (f2.outputItem()) {
    console.log(`Taking ${f2.outputItem().count} ${f2.outputItem().name}...`)
    await f2.takeOutput()
  }
  f2.close()
}

console.log('Iron ingots on beta:', lib.count('iron_ingot'))

// Craft bucket
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0) {
  console.log('Crafting bucket...')
  await lib.craft('bucket', 1)
  console.log('BUCKET CRAFTED!')
  bot.chat('beta: Iron bucket crafted successfully!')
}

console.log('Beta inv:', JSON.stringify(lib.inv()))
console.log('Beta tools:', JSON.stringify(lib.tools()))
