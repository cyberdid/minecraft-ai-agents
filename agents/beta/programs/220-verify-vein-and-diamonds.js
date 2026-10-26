console.log('=== Verifying Iron & Diamond Column ===')

const ores = bot.findBlocks({
  matching: b => b && (b.name.includes('iron_ore') || b.name.includes('diamond_ore')),
  maxDistance: 64,
  count: 30
})

console.log(`Found ${ores.length} iron/diamond ores nearby:`)
for (const p of ores) {
  const b = bot.blockAt(p)
  console.log(`  ${b.name} at ${lib.fmt(p)} dist: ${p.distanceTo(bot.entity.position).toFixed(1)}`)
}

const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log(`Alpha at ${lib.fmt(alpha.entity.position)}`)
}
