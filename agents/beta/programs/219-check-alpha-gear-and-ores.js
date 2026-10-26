console.log('=== Coordinate with Alpha & Plan Diamond Mining ===')

bot.chat('alpha: Beta crafted flint_and_steel! Diamonds located at (310, 2, -44) and (286, 5, -65). Do you have an iron pickaxe or 3 iron ingots?')

// 1. Check Alpha
const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log(`Alpha at: ${lib.fmt(alpha.entity.position)}, held: ${alpha.entity.heldItem?.name}`)
}

// 2. Check chest for any iron
const chest = await lib.chestContents()
console.log('Chest:', JSON.stringify(chest))

// 3. Inspect iron ores nearby at y >= 50
const ironOres = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore') && b.position.y >= 50,
  maxDistance: 48,
  count: 10
})
console.log(`Found ${ironOres.length} iron ores at y>=50:`)
for (const p of ironOres) {
  console.log(`  ${bot.blockAt(p).name} at ${lib.fmt(p)} dist: ${p.distanceTo(bot.entity.position).toFixed(1)}`)
}

// 4. Check time
const t = lib.time()
console.log('Time:', JSON.stringify(t))
