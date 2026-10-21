// Walk up the staircase all the way to surface exit at (340, 75, -30)
console.log('Walking up to surface (340, 75, -30)...')
await lib.goTo(340, 75, -30, 2)
console.log('Reached surface! Beta pos:', bot.entity.position)
return { pos: bot.entity.position }
