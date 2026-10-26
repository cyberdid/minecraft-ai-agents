const t = lib.time()
console.log('Time:', JSON.stringify(t))
console.log('Beta pos:', lib.fmt(bot.entity.position))
console.log('Food:', bot.food, 'Health:', bot.health)

const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log('Alpha at:', lib.fmt(alpha.entity.position), 'dist:', alpha.entity.position.distanceTo(bot.entity.position).toFixed(1))
} else {
  console.log('Alpha entity not loaded')
}

// Check base door
const doorBlock = bot.blockAt(new Vec3(294, 72, -54))
console.log('Door at (294, 72, -54):', doorBlock?.name)

bot.chat(`beta: at base, night in ${t.secondsUntilNight}s. Ready to sleep in Bed 2. Food is ${bot.food}.`)
