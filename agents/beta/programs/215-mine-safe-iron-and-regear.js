console.log('=== Mine Safe Iron & Re-gear ===')

// 1. Eat cooked beef
if (lib.count('cooked_beef') > 0 && bot.food < 20) {
  try {
    await bot.equip(mcData.itemsByName.cooked_beef.id, 'hand')
    await bot.consume()
    console.log('Ate cooked beef. Food:', bot.food)
  } catch (e) {}
}

// 2. Step outside base door
try {
  await lib.goThroughDoor(294, 72, -54)
  console.log('Outside door at:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Door note:', e.message)
}

bot.chat('beta: Mining 12 raw iron from hillside at (311, 62, -65) to re-craft iron pickaxe, bucket, and flint & steel.')

// 3. Move to hillside iron vein at (311, 62, -65)
await lib.goTo(311, 62, -65, 2, { timeoutMs: 25000 })
console.log('At hillside iron site:', lib.fmt(bot.entity.position))

// 4. Mine iron ores
let mined = 0
for (let i = 0; i < 15; i++) {
  if (isCancelled() || lib.count('raw_iron') >= 12) break
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 16, count: 5 })
  if (ores.length === 0) break
  const target = ores[0].position
  // Only mine if y >= 50 (safe surface hillside, avoiding deep caverns!)
  if (target.y < 50) {
    console.log(`Skipping deep ore at ${lib.fmt(target)} for safety`)
    continue
  }
  console.log(`Mining safe iron ore at ${lib.fmt(target)}...`)
  try {
    await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand')
    await lib.goTo(target.x, target.y + 1, target.z, 2, { timeoutMs: 15000 })
    await lib.dig(target.x, target.y, target.z)
    await sleep(200)
    await lib.pickup(4)
    mined++
  } catch (e) {
    console.log(`Dig error: ${e.message}`)
  }
}

console.log(`Mined ${mined} iron ores! Raw iron on beta: ${lib.count('raw_iron')}`)

// 5. Chop 3 oak logs on the way back for furnace fuel and sticks
try {
  console.log('Collecting 3 logs for fuel...')
  await lib.collect('*_log', 3)
} catch (e) {
  console.log('Collect log note:', e.message)
}

// 6. Return into base
console.log('Returning to base...')
await lib.goTo(294, 72, -53, 2, { timeoutMs: 25000 })
try {
  await lib.goThroughDoor(294, 72, -54)
} catch (e) {}

console.log('Inside base at:', lib.fmt(bot.entity.position))
console.log('Beta inv:', JSON.stringify(lib.inv()))
bot.chat(`beta: Returned to base with ${lib.count('raw_iron')} raw iron and logs! Starting smelting.`)
