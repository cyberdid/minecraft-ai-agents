// programs/019-check-site-and-sandstone.js
console.log('alpha at base:', lib.fmt(bot.entity.position))

// Check beta
const beta = bot.players.beta?.entity
if (beta) {
  console.log('beta is at:', lib.fmt(beta.position), 'dist:', Math.round(bot.entity.position.distanceTo(beta.position)))
} else {
  console.log('beta is not in loaded chunks yet')
}

// Check sandstone recipe
try {
  console.log('sandstone recipe:', lib.recipe('sandstone'))
} catch (e) {
  console.log('recipe err:', e.message)
}

// Check time
const t = lib.time()
console.log(`TIME: ${t.timeOfDay} | night in ${t.secondsUntilNight}s`)

return { beta: !!beta, time: t }
