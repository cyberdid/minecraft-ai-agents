console.log('=== Mining Nearby Diamond Ores ===')

// 1. Scan for diamond ores within 32 blocks
const diamonds = bot.findBlocks({
  matching: b => b && (b.name === 'diamond_ore' || b.name === 'deepslate_diamond_ore'),
  maxDistance: 32,
  count: 10
})

console.log(`Found ${diamonds.length} diamond ores within 32 blocks:`)
for (const p of diamonds) {
  console.log(`  ${bot.blockAt(p).name} at ${lib.fmt(p)} dist: ${p.distanceTo(bot.entity.position).toFixed(1)}`)
}

if (diamonds.length === 0) {
  console.log('Searching within 48 blocks...')
  const wide = bot.findBlocks({
    matching: b => b && (b.name === 'diamond_ore' || b.name === 'deepslate_diamond_ore'),
    maxDistance: 48,
    count: 10
  })
  console.log(`Found ${wide.length} diamond ores within 48 blocks:`, wide.map(p => lib.fmt(p)))
}

// 2. Mine diamond ores with iron pickaxe
for (let i = 0; i < diamonds.length; i++) {
  if (lib.count('diamond') >= 3 || isCancelled()) break
  const target = diamonds[i]
  console.log(`Mining diamond at ${lib.fmt(target)}...`)
  try {
    await lib.goTo(target.x, target.y, target.z, 2, { dig: true, timeoutMs: 25000 })
    await bot.equip(mcData.itemsByName.iron_pickaxe.id, 'hand')
    await lib.dig(target.x, target.y, target.z)
    await sleep(200)
    await lib.pickup(4)
    console.log(`Mined diamond! Total diamonds now: ${lib.count('diamond')}`)
  } catch (e) {
    console.log(`Mining error at ${lib.fmt(target)}: ${e.message}`)
  }
}

console.log('Final Diamonds on beta:', lib.count('diamond'))
bot.chat(`beta: Mined diamonds! Total diamond count: ${lib.count('diamond')}.`)
console.log('Beta inv:', JSON.stringify(lib.inv()))
console.log('Beta tools:', JSON.stringify(lib.tools()))
