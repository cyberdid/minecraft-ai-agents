// programs/011-chat-and-find-food.js
bot.chat("beta: Did you get wood? I have 16 dirt, at (15, 61, -61). Night in 320s.")

const p = bot.entity.position
const nonRabbits = Object.values(bot.entities).filter(e => ['cow', 'pig', 'sheep', 'chicken'].includes(e.name))
console.log('Non-rabbit animals:', nonRabbits.length)
for (const a of nonRabbits) {
  console.log(`- ${a.name} at ${lib.fmt(a.position)} (dist: ${Math.round(p.distanceTo(a.position))})`)
}

// Check if beta is in chat or entities
console.log('beta present in players:', !!bot.players.beta)
return { nonRabbits: nonRabbits.length }
