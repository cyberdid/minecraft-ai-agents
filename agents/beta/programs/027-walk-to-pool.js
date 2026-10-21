// Walk down to the pool edge
console.log('Moving towards pool edge at (350, -54, -30)...')
await lib.goTo(350, -54, -30, 2)
console.log('Arrived at:', bot.entity.position)
const hostiles = lib.hostiles(16)
console.log('Nearby hostiles:', JSON.stringify(hostiles))
return { pos: bot.entity.position, hostiles }
