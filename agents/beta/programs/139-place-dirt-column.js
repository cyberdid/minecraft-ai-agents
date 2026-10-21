console.log('Placing dirt at (348, 64, -31)...')
const p1 = await lib.place('dirt', 348, 64, -31)
console.log('P1:', p1)

console.log('Placing dirt at (348, 65, -31)...')
const p2 = await lib.place('dirt', 348, 65, -31)
console.log('P2:', p2)

console.log('Position:', bot.entity.position)
