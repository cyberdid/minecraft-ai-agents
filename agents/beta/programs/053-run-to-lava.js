// Run down to the lava pool
bot.chat('beta: heading down safe stairs to get final 2 obsidian')
console.log('Heading to staircase top at (340, 75, -30)...')
await lib.goTo(340, 75, -30, 2)
console.log('Heading down to pool at (344, -54, -32)...')
await lib.goTo(344, -54, -32, 2)
console.log('At lava pool! Beta pos:', bot.entity.position)
return { pos: bot.entity.position }
