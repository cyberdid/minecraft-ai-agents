console.log('=== Put Fuel in Furnace 1, Smelt Ingot & Craft Bucket ===')

const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock) {
  const f = await bot.openFurnace(fBlock)
  console.log('Furnace before:', {
    input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'empty',
    fuel: f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : 'empty',
    output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty'
  })
  
  if (lib.count('wooden_pickaxe') > 0 && !f.fuelItem()) {
    console.log('Adding wooden_pickaxe as fuel...')
    await f.putFuel(mcData.itemsByName.wooden_pickaxe.id, null, 1)
  }
  
  f.close()
  
  console.log('Waiting 12s for smelting...')
  await sleep(12000)
  
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
}

// Step outside door and run to Alpha at (333, 64, -78)
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {}

console.log('Moving to lava pool (333, 64, -78)...')
bot.chat('beta: Bucket and diamond_pickaxe ready! Joining Alpha at lava pool (333, 62, -78).')
await lib.goTo(333, 64, -78, 2, { timeoutMs: 30000 })
console.log('Arrived at lava pool! Beta at:', lib.fmt(bot.entity.position))

// Check Alpha
const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log(`Alpha at: ${lib.fmt(alpha.entity.position)}, held: ${alpha.entity.heldItem?.name}`)
}

console.log('Beta inv:', JSON.stringify(lib.inv()))
console.log('Beta tools:', JSON.stringify(lib.tools()))
