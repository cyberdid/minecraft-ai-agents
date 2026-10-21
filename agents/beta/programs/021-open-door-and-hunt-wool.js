// 021-open-door-and-hunt-wool.js - open door for alpha, hunt 3 wool for alpha's bed
console.log('Position inside base:', lib.fmt(bot.entity.position))

// Open door for alpha
try {
  await lib.door(294, 72, -54, true)
} catch (e) {
  console.log('Door open note:', e.message)
}

bot.chat('alpha: Door open! Food and sword are in the chest. Right-click bed to set spawn. I am getting 3 wool for your bed.')

// Step through door
try {
  await lib.walkTo(294, -52)
} catch (e) {
  console.log('Walk out note:', e.message)
}
console.log('Outside base at:', lib.fmt(bot.entity.position))

// Hunt sheep for 3 wool
console.log('Heading towards (334, 72, -29) for sheep...')
try {
  await lib.hunt('sheep', 3)
} catch (e) {
  console.log('Sheep hunt note:', e.message)
}

// Pickup drops
await lib.pickup(12)

const wool = lib.count('*_wool')
console.log('Total wool in inventory now:', wool)
const t = lib.time()
console.log('Time left in day:', t.secondsUntilNight)

// Return towards base
console.log('Returning to base...')
try {
  await lib.goTo(294, 72, -52, 2)
  console.log('Back near base:', lib.fmt(bot.entity.position))
} catch (e) {
  console.log('Return note:', e.message)
}

return { wool, inv: lib.inv(), time: lib.time() }
