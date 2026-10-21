console.log('Checking chest and furnaces for iron and food...')
const chest = await lib.chestContents()
console.log('Chest:', JSON.stringify(chest))

// Check Furnace 1 and Furnace 2 for any extra ingots
const f1 = await bot.openFurnace(bot.blockAt(new Vec3(295, 72, -55)))
console.log('F1 output:', f1.outputItem()?.count)
if (f1.outputItem()?.count > 0) await f1.takeOutput()
f1.close()

console.log('Iron ingots on beta:', lib.count('iron_ingot'))

// If we have 4 ingots, craft iron_boots!
if (lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots...')
  await lib.craft('iron_boots', 1)
  await lib.equipArmor()
  bot.chat('beta: FULL IRON ARMOR COMPLETE! Milestone 3 achieved for both players!')
}

// Check Alpha's status
const alpha = Object.values(bot.entities).find(e => e.username === 'alpha')
if (alpha) {
  console.log(`Alpha is at: (${alpha.position.x.toFixed(1)}, ${alpha.position.y.toFixed(1)}, ${alpha.position.z.toFixed(1)}) dist: ${bot.entity.position.distanceTo(alpha.position).toFixed(1)}`)
}

// Hunt 2-3 cows/sheep nearby to feed Alpha
const animals = bot.entities ? Object.values(bot.entities).filter(e => (e.name === 'cow' || e.name === 'pig' || e.name === 'sheep') && e.position.distanceTo(bot.entity.position) < 32) : []
console.log(`Found ${animals.length} animals within 32 blocks:`, animals.map(a => `${a.name} at ${a.position.distanceTo(bot.entity.position).toFixed(1)}m`))

if (animals.length > 0) {
  bot.chat('beta: Hunting food for us alpha! Hold on!')
  try {
    await lib.hunt(animals[0].name, 2)
  } catch (e) {
    console.log('Hunt note:', e.message)
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()))
console.log('Beta tools/gear:', JSON.stringify(lib.tools()))
return { inv: lib.inv(), tools: lib.tools() }
