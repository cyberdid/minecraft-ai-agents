console.log('=== Retrieve Ingot & Craft Bucket ===')

// 1. Walk back into base
await lib.goTo(294, 72, -53, 1, { timeoutMs: 25000 })
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {}
console.log('Inside base at:', lib.fmt(bot.entity.position))

// 2. Open Furnace 1 to take output
const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock) {
  try {
    const f = await bot.openFurnace(fBlock)
    if (f.outputItem()) {
      console.log(`Taking ${f.outputItem().count} ${f.outputItem().name} from Furnace 1...`)
      await f.takeOutput()
    }
    f.close()
  } catch (e) {}
}

console.log('Iron ingots on beta:', lib.count('iron_ingot'))

// 3. Craft bucket
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0) {
  console.log('Crafting bucket at base table...')
  await lib.craft('bucket', 1)
  console.log('Bucket crafted!')
}

// 4. Check chest for water_bucket or food
const chest = await lib.chestContents()
console.log('Chest:', JSON.stringify(chest))
if (chest['water_bucket'] > 0) {
  console.log('Taking water_bucket from chest!')
  await lib.withdraw({ water_bucket: 1 })
}

// Check floor for items
await lib.pickup(4)

bot.chat(`beta: Bucket crafted (${lib.count('bucket')} empty, ${lib.count('water_bucket')} water). Ready for obsidian!`)
console.log('Beta inv:', JSON.stringify(lib.inv()))
console.log('Beta tools:', JSON.stringify(lib.tools()))
