console.log('=== Request / Acquire Water Bucket ===')

bot.chat('alpha: I have the diamond_pickaxe! Please toss me the water_bucket or put it in the chest so I can get 10 obsidian.')

// Check for items tossed on floor
await sleep(3000)
await lib.pickup(4)

// Check chest
const chest = await lib.chestContents()
console.log('Chest:', JSON.stringify(chest))

if (chest['water_bucket'] > 0) {
  console.log('Taking water_bucket from chest...')
  await lib.withdraw({ water_bucket: 1 })
} else if (chest['bucket'] > 0 && lib.count('bucket') === 0 && lib.count('water_bucket') === 0) {
  console.log('Taking empty bucket from chest...')
  await lib.withdraw({ bucket: 1 })
}

// If we don't have bucket or water_bucket, craft one from iron
if (lib.count('bucket') === 0 && lib.count('water_bucket') === 0) {
  console.log('Checking iron for bucket...')
  if (lib.count('iron_ingot') < 3 && lib.count('raw_iron') > 0) {
    // Smelt 1 raw iron in furnace
    const fBlock = bot.blockAt(new Vec3(295, 72, -55))
    if (fBlock) {
      try {
        const f = await bot.openFurnace(fBlock)
        if (lib.count('raw_iron') > 0) {
          await f.putInput(mcData.itemsByName.raw_iron.id, null, 1)
        }
        f.close()
        // Wait for smelt
        await sleep(12000)
        const f2 = await bot.openFurnace(fBlock)
        if (f2.outputItem()) await f2.takeOutput()
        f2.close()
      } catch (e) {
        console.log('Smelt iron note:', e.message)
      }
    }
  }
  if (lib.count('iron_ingot') >= 3) {
    console.log('Crafting bucket...')
    await lib.craft('bucket', 1)
  }
}

console.log('Beta bucket status:', {
  water_bucket: lib.count('water_bucket'),
  bucket: lib.count('bucket')
})
console.log('Beta inv:', JSON.stringify(lib.inv()))
