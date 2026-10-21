// programs/013-check-beta-status.js
const beta = bot.players.beta?.entity
console.log('beta loaded:', !!beta)
if (beta) {
  console.log('beta pos:', lib.fmt(beta.position), 'dist:', Math.round(bot.entity.position.distanceTo(beta.position)))
} else {
  console.log('beta is far away (not in loaded chunks)')
}

// Check time
const t = lib.time()
console.log(`time: ${t.timeOfDay} (${t.phase}) | night in ${t.secondsUntilNight}s`)
return t
