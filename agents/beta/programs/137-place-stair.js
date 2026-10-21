console.log('Placing dirt step at (348, 63, -31)...')
const res1 = await lib.place('dirt', 348, 63, -31)
console.log('Placed (348, 63, -31):', res1)

// Walk onto (348, 63, -31)
console.log('Stepping onto (348, 63, -31)...')
await lib.goTo(348, 63, -31, 0.5)
console.log('Now at:', bot.entity.position)

// Place dirt step at (348, 64, -31) or next step
const res2 = await lib.place('dirt', 348, 64, -31)
console.log('Placed (348, 64, -31):', res2)

return bot.entity.position
