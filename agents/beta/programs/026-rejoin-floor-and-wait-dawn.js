// 026-rejoin-floor-and-wait-dawn.js - step up to base floor, patch any remaining hole, wait until dawn tick 23460
console.log('Current position:', lib.fmt(bot.entity.position))

// Ascend back to base floor at (294, 72, -56)
try {
  await lib.goTo(294, 72, -56, 1, { dig: false })
  console.log('Reached floor at:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Pathfind up note:', e.message)
  // Try placing a dirt block under feet or climbing
  if (bot.entity.position.y < 72 && lib.count('dirt') > 0) {
    try {
      await lib.place('dirt', Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y), Math.floor(bot.entity.position.z))
    } catch (e2) {}
  }
}

// Check floor around (292..295, 71, -57..-55) and patch with dirt
for (let x = 292; x <= 295; x++) {
  for (let z = -57; z <= -55; z++) {
    const f = lib.blockAt(x, 71, z)
    if (!f || f.boundingBox !== 'block') {
      console.log(`Patching floor at (${x}, 71, ${z})...`)
      try {
        await lib.place('dirt', x, 71, z)
      } catch (err) {}
    }
  }
}

console.log('Position now:', lib.fmt(bot.entity.position))
console.log('Alpha at:', bot.players.alpha?.entity?.position ? lib.fmt(bot.players.alpha.entity.position) : 'unknown')

bot.chat('beta: Sheltered safely inside base. Waiting for dawn tick 23460.')

// Wait until dawn
while (!isCancelled()) {
  const t = lib.time()
  console.log(`Tick: ${t.timeOfDay} (${t.phase})`)
  if (t.timeOfDay >= 23460 || t.timeOfDay < 12000) {
    console.log('Dawn reached!')
    bot.chat('beta: Dawn is here! Starting iron and food operations.')
    break
  }
  await sleep(10000)
}

const hostiles = lib.hostiles(16)
console.log('Hostiles at dawn:', JSON.stringify(hostiles))
return { time: lib.time(), hostiles }
