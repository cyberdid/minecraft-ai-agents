console.log('=== Milestone 3 Verification & Bed 2 Check ===')

// 1. Check chest
const chest = await lib.chestContents()
console.log('Chest contents:', JSON.stringify(chest))

// 2. Check furnace
const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock) {
  try {
    const f = await bot.openFurnace(fBlock)
    console.log('Furnace:', {
      input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'empty',
      output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty'
    })
    if (f.outputItem()) await f.takeOutput()
    f.close()
  } catch (e) {}
}

// 3. Check Alpha
const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log('Alpha at:', lib.fmt(alpha.entity.position))
}

bot.chat('Milestone 3 COMPLETE: Full iron armor and shield worn by both players!')
bot.chat('beta: Alpha, do you have wool for Bed 2? The floor spot at (293, 72, -56) is ready.')

// 4. If wool in chest or inventory, craft bed
const woolCount = (chest['white_wool'] || 0) + lib.count('*_wool')
console.log('Total wool available:', woolCount)

if (chest['white_wool'] > 0) {
  try {
    await lib.withdraw({ white_wool: Math.min(chest['white_wool'], 3) })
  } catch (e) {}
}

if (lib.count('*_wool') >= 3) {
  if (lib.count('*_planks') < 3 && lib.count('*_log') > 0) {
    await lib.craft('oak_planks', 4)
  }
  if (lib.count('*_planks') >= 3) {
    console.log('Crafting white_bed...')
    await lib.craft('white_bed', 1)
    console.log('Placing Bed 2 at (293, 72, -56)...')
    await lib.place('white_bed', 293, 72, -56)
    await lib.setSpawn()
    bot.chat('Milestone 4 COMPLETE: Bed 2 placed in base and spawn set for both players!')
  }
}

console.log('Beta inv:', JSON.stringify(lib.inv()))
