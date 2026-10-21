// programs/024-inspect-ground-and-beta.js
const p = bot.entity.position
console.log('alpha at:', lib.fmt(p))

// Inspect column directly under alpha
for (let dy = 0; dy >= -4; dy--) {
  const b = bot.blockAt(p.offset(0, dy, 0))
  console.log(`dy=${dy} (${Math.floor(p.x)}, ${Math.floor(p.y + dy)}, ${Math.floor(p.z)}): ${b?.name}`)
}

// Check beta: what is beta doing?
const beta = bot.players.beta?.entity
if (beta) {
  console.log('beta at:', lib.fmt(beta.position))
  // check block at beta's feet
  const bUnderBeta = bot.blockAt(beta.position.offset(0, -1, 0))
  console.log('block under beta:', bUnderBeta?.name)
}

// Check time
const t = lib.time()
console.log(`TIME: ${t.timeOfDay} (${t.phase}) | night in ${t.secondsUntilNight}s`)

return { t, inv: lib.inv() }
