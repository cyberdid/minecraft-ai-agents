console.log('=== Night Survey & Safe Indoor Work ===')
const t = lib.time()
console.log('Time:', JSON.stringify(t))
console.log('Hostiles within 16:', JSON.stringify(lib.hostiles(16)))

// 1. Scan for iron ores
const ironOres = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 64,
  count: 30
})
console.log(`Found ${ironOres.length} iron ores within 64 blocks:`)
for (const p of ironOres.slice(0, 10)) {
  console.log(`  ${bot.blockAt(p).name} at ${lib.fmt(p)} dist: ${p.distanceTo(bot.entity.position).toFixed(1)}`)
}

// 2. Scan for coal ores
const coalOres = bot.findBlocks({
  matching: b => b && (b.name === 'coal_ore' || b.name === 'deepslate_coal_ore'),
  maxDistance: 64,
  count: 10
})
console.log(`Found ${coalOres.length} coal ores within 64 blocks:`)
for (const p of coalOres.slice(0, 5)) {
  console.log(`  ${bot.blockAt(p).name} at ${lib.fmt(p)} dist: ${p.distanceTo(bot.entity.position).toFixed(1)}`)
}

// 3. Check Alpha
const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log(`Alpha at ${lib.fmt(alpha.entity.position)}`)
} else {
  console.log('Alpha entity not loaded')
}

// 4. Craft stone shovel and test gravel for flint
console.log('Flint count:', lib.count('flint'))
console.log('Gravel count:', lib.count('gravel'))
if (lib.count('flint') === 0) {
  // Check if chest has gravel
  try {
    await lib.withdraw({ gravel: 2 })
    console.log('Withdrew gravel from chest. Gravel now:', lib.count('gravel'))
  } catch (e) {
    console.log('Withdraw gravel note:', e.message)
  }
}
