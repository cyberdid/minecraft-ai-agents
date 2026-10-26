console.log('=== Walk Straight to Pool & Make Obsidian ===')

bot.chat('beta: Walking to lava pool (333, 62, -78) with water_bucket and diamond_pickaxe!')

// 1. Walk east to (333, -78)
console.log('Walking to (333, -78)...')
await lib.goToXZ(333, -78, { timeoutMs: 45000 })
console.log('Arrived at lava pool area! Beta at:', lib.fmt(bot.entity.position))

// 2. Approach pool edge at (333, 64, -78)
try {
  await lib.goTo(333, 64, -78, 2, { timeoutMs: 15000 })
} catch (e) {}
console.log('At pool edge:', lib.fmt(bot.entity.position))

// Check Alpha
const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log(`Alpha at: ${lib.fmt(alpha.entity.position)}`)
}

// 3. Check lava sources at pool
const lava = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 16,
  count: 20
})
console.log(`Lava sources in reach: ${lava.length}`, lava.map(p => lib.fmt(p)))

// 4. Run lib.makeObsidian(10)
console.log('Starting lib.makeObsidian(10)...')
try {
  const res = await lib.makeObsidian(10)
  console.log('makeObsidian result:', JSON.stringify(res))
  bot.chat(`beta: Obsidian mined! Count: ${lib.count('obsidian')}.`)
} catch (e) {
  console.log('makeObsidian note:', e.message)
  bot.chat(`beta: makeObsidian note: ${e.message}`)
}

console.log('Obsidian on beta:', lib.count('obsidian'))
console.log('Beta inv:', JSON.stringify(lib.inv()))
console.log('Beta tools:', JSON.stringify(lib.tools()))
