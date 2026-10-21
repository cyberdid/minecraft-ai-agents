// Walk up the staircase towards surface
console.log('Walking up to (367, -38, -30)...')
await lib.goTo(367, -38, -30, 1)
console.log('Beta pos:', bot.entity.position)
console.log('Time:', lib.time())
return { pos: bot.entity.position, time: lib.time() }
