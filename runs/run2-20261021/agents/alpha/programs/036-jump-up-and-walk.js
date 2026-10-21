// programs/036-jump-up-and-walk.js
console.log('alpha at:', lib.fmt(bot.entity.position))

// Jump towards South-West to land on y=64/65
await bot.lookAt(new Vec3(32, 66, -43), true)
bot.setControlState('forward', true)
bot.setControlState('jump', true)
await sleep(800)
bot.clearControlStates()

console.log('alpha position after jump:', lib.fmt(bot.entity.position))

// Now walk towards base (10, 67, -25)
console.log('Navigating to base (10, 67, -25)...')
await lib.goTo(10, 67, -25, 2, { dig: true })
console.log('Arrived at base:', lib.fmt(bot.entity.position))

return lib.status()
