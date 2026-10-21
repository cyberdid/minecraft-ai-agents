// 001-init.js - greet alpha, check players, survey immediate surroundings
const me = bot.entity.position
console.log('My position:', lib.fmt(me))

bot.chat('Hi alpha! beta here, spawned at ' + lib.fmt(me) + '. Setting up now.')

const players = Object.keys(bot.players).map(name => {
  const p = bot.players[name]
  const pos = p?.entity?.position
  return `${name}${pos ? ' at ' + lib.fmt(pos) : ' (no entity)'}`
})
console.log('Players:', players.join(', '))

const logs = lib.find('*_log', { maxDistance: 32, count: 5 })
console.log('Nearby logs:', logs.length ? logs.map(b => `${b.name} at ${lib.fmt(b.position)}`).join(', ') : 'none within 32')

const stone = lib.find('stone', { maxDistance: 32, count: 5 })
console.log('Nearby stone:', stone.length ? stone.map(b => `${b.name} at ${lib.fmt(b.position)}`).join(', ') : 'none within 32')

const cows = bot.nearestEntity(e => e.name === 'cow')
const sheep = bot.nearestEntity(e => e.name === 'sheep')
console.log('Nearby cow:', cows ? lib.fmt(cows.position) : 'none')
console.log('Nearby sheep:', sheep ? lib.fmt(sheep.position) : 'none')

return { time: lib.time(), pos: me }
