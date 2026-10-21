// programs/028-safe-night-check.js
bot.chat("beta: I'm safely sealed in my shelter for the night! Are you sheltered too?")

const t = lib.time()
console.log(`TIME: ${t.timeOfDay} (${t.phase}) | canSleep: ${t.canSleep}`)

const hostiles = lib.hostiles(16)
console.log('Hostiles within 16 blocks:', hostiles.length)
for (const h of hostiles) {
  console.log(`- ${h.name} at ${h.pos} dist: ${h.dist}`)
}

const beta = bot.players.beta?.entity
if (beta) {
  console.log('Beta pos:', lib.fmt(beta.position))
} else {
  console.log('Beta entity not in view')
}

return { time: t, hostiles: hostiles.length }
