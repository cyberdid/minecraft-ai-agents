console.log('=== Fuel Furnace & Mine Iron ===')

// 1. Put fuel into furnace for remaining beef
try {
  const fBlock = bot.blockAt(new Vec3(295, 72, -55))
  if (fBlock) {
    const f = await bot.openFurnace(fBlock)
    if (lib.count('birch_planks') > 0) {
      console.log('Putting 2 birch_planks as fuel...')
      await f.putFuel(mcData.itemsByName.birch_planks.id, null, Math.min(lib.count('birch_planks'), 2))
    }
    // Take any output already ready
    if (f.outputItem()?.count > 0) {
      await f.takeOutput()
    }
    f.close()
  }
} catch (e) {
  console.log('Furnace fuel note:', e.message)
}

// 2. Go through base door
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Stepped outside. Pos:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Door exit note:', e.message)
}

bot.chat('beta: Mining iron at (311, 65, -65) for boots, shield and tools!')

// 3. Move to iron vein at (311, 65, -65)
console.log('Walking to (311, 65, -65)...')
await lib.goTo(311, 65, -65, 2, { timeoutMs: 40000 })
console.log('Arrived above iron vein. Beta at:', lib.fmt(bot.entity.position))

// 4. Mine iron ores
let mined = 0
for (let i = 0; i < 12; i++) {
  if (isCancelled()) break
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 16, count: 5 })
  if (ores.length === 0) {
    console.log('No more iron ores in reach')
    break
  }
  const target = ores[0].position
  console.log(`Mining iron ore at ${lib.fmt(target)}...`)
  try {
    await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand')
    await lib.goTo(target.x, target.y + 1, target.z, 2, { timeoutMs: 20000 })
    await lib.dig(target.x, target.y, target.z)
    await sleep(200)
    await lib.pickup(4)
    mined++
  } catch (e) {
    console.log(`Dig error at ${lib.fmt(target)}:`, e.message)
  }
  if (lib.count('raw_iron') >= 10) break
}

console.log(`Mined ${mined} ores. Raw iron on beta: ${lib.count('raw_iron')}`)
bot.chat(`beta: Mined ${lib.count('raw_iron')} raw iron! Returning to base to smelt.`)

// 5. Return to base door
console.log('Returning to base...')
await lib.goTo(294, 72, -53, 2, { timeoutMs: 40000 })
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Inside base at:', lib.fmt(bot.entity.position))
} catch (e) {}

console.log('Beta inv at end:', JSON.stringify(lib.inv()))
