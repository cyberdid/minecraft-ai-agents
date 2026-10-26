console.log('=== Place Clean Furnace & Smelt Bucket ===')

// 1. Place our furnace at (293, 72, -54)
const target = new Vec3(293, 72, -54)
if (bot.blockAt(target)?.name !== 'furnace') {
  try {
    await lib.place('furnace', target.x, target.y, target.z)
    console.log('Placed clean furnace at (293, 72, -54)')
  } catch (e) {
    console.log('Place furnace error:', e.message)
  }
}

// 2. Open our clean furnace
const f = await bot.openFurnace(bot.blockAt(target))
console.log('Clean furnace opened!')

// Put wooden pickaxe as fuel
if (lib.count('wooden_pickaxe') > 0) {
  await f.putFuel(mcData.itemsByName.wooden_pickaxe.id, null, 1)
  console.log('Put wooden pickaxe as fuel')
}

// Put 1 raw iron as input
if (lib.count('raw_iron') > 0) {
  await f.putInput(mcData.itemsByName.raw_iron.id, null, 1)
  console.log('Put 1 raw iron as input')
}

f.close()

// 3. Wait 12 seconds for smelting
console.log('Waiting 12s for smelt...')
await sleep(12000)

// 4. Take output
const f2 = await bot.openFurnace(bot.blockAt(target))
if (f2.outputItem()) {
  console.log(`Taking ${f2.outputItem().count} iron ingot!`)
  await f2.takeOutput()
}
f2.close()

console.log('Iron ingots on beta:', lib.count('iron_ingot'))

// 5. Craft bucket at crafting table
if (lib.count('iron_ingot') >= 3) {
  console.log('Crafting bucket...')
  await lib.craft('bucket', 1)
  console.log('BUCKET CRAFTED!')
  bot.chat('beta: Iron bucket crafted! Ready for water and obsidian.')
}

console.log('Beta inv:', JSON.stringify(lib.inv()))
console.log('Beta tools:', JSON.stringify(lib.tools()))
