console.log('=== Cooking Check, Eating & Alpha Status ===')

// 1. Check furnace for cooked beef
const fBlock = bot.blockAt(new Vec3(295, 72, -55))
if (fBlock) {
  try {
    const f = await bot.openFurnace(fBlock)
    console.log('Furnace state:', {
      input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'empty',
      fuel: f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : 'empty',
      output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty',
      progress: f.progress
    })
    if (f.outputItem()?.count > 0) {
      console.log(`Taking ${f.outputItem().count} output from furnace...`)
      await f.takeOutput()
    }
    f.close()
  } catch (e) {
    console.log('Furnace error:', e.message)
  }
}

// 2. Eat cooked beef if available
console.log('Cooked beef on beta:', lib.count('cooked_beef'))
while (bot.food < 18 && lib.count('cooked_beef') > 0 && !isCancelled()) {
  console.log(`Eating cooked beef! Food: ${bot.food}`)
  try {
    await bot.equip(mcData.itemsByName.cooked_beef.id, 'hand')
    await bot.consume()
    console.log(`Ate cooked beef! Food now: ${bot.food}`)
  } catch (e) {
    console.log('Consume error:', e.message)
    break
  }
}

// 3. Check Alpha
const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log(`Alpha at: ${lib.fmt(alpha.entity.position)} dist: ${alpha.entity.position.distanceTo(bot.entity.position).toFixed(1)}`)
} else {
  console.log('Alpha entity not loaded in view')
}

// 4. Check chest contents
const chest = await lib.chestContents()
console.log('Chest:', JSON.stringify(chest))

console.log('Beta inventory:', JSON.stringify(lib.inv()))
