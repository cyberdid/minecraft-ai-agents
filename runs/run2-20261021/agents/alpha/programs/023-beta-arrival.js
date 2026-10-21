// programs/023-beta-arrival.js
const p = bot.entity.position
console.log('alpha at:', lib.fmt(p))

// Check beta
const beta = bot.players.beta?.entity
if (beta) {
  console.log('Beta pos:', lib.fmt(beta.position), 'dist:', Math.round(p.distanceTo(beta.position)))
} else {
  console.log('Beta not loaded')
}

// Pickup any items dropped nearby
const gained = await lib.pickup(10)
console.log('Items picked up:', gained)

// Check time
const t = lib.time()
console.log(`TIME: ${t.timeOfDay} (${t.phase}) | night in ${t.secondsUntilNight}s`)

console.log('Alpha inventory:', JSON.stringify(lib.inv()))
return { time: t, inv: lib.inv(), betaDist: beta ? Math.round(p.distanceTo(beta.position)) : null }
