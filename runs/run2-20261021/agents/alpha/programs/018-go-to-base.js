// programs/018-go-to-base.js
bot.chat("beta: Heading to base (10, 67, -25) now to meet you! Night in ~210s.")

console.log('alpha at:', lib.fmt(bot.entity.position))
console.log('Moving to (10, 67, -25)...')

try {
  await lib.goTo(10, 67, -25, 2, { dig: true })
} catch (e) {
  console.log('goTo failed, trying goToXZ:', e.message)
  await lib.goToXZ(10, -25, { dig: true })
}

console.log('Arrived at:', lib.fmt(bot.entity.position))
return lib.status()
