console.log('=== Put Raw Iron into Furnace & Smelt ===')

const fBlock = bot.blockAt(new Vec3(295, 72, -55))
const f = await bot.openFurnace(fBlock)
console.log('Putting raw_iron into furnace input...')
await f.putInput(mcData.itemsByName.raw_iron.id, null, 4)
console.log('Raw iron placed!')
f.close()

console.log('Waiting for iron ingots to smelt...')
while (lib.count('iron_ingot') < 3 && !isCancelled()) {
  await sleep(3000)
  const f2 = await bot.openFurnace(fBlock)
  if (f2.outputItem()?.name === 'iron_ingot') {
    console.log(`Taking ${f2.outputItem().count} iron ingots...`)
    await f2.takeOutput()
  }
  f2.close()
  console.log(`Iron ingots on beta: ${lib.count('iron_ingot')}`)
}

if (lib.count('iron_ingot') >= 3) {
  console.log('Crafting iron_pickaxe...')
  await lib.craft('iron_pickaxe', 1)
  console.log('Iron pickaxe crafted!')
  bot.chat('Milestone 2 update: Beta crafted iron_pickaxe! All iron tools ready.')
}

console.log('Beta tools:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
