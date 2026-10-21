// Continue ascending staircase to (340, 75, -30)
console.log('Continuing ascent from (301, 28, -30) to (340, 75, -30)...')
await lib.goTo(340, 75, -30, 2)
console.log('Arrived at surface exit! Position:', bot.entity.position)
return { pos: bot.entity.position }
