// programs/001-hello-survey.js
// Say hello to beta, check beta's status, and survey nearby terrain

bot.chat("Hi beta! alpha here. Let's build a house together near spawn.")

const betaPlayer = bot.players.beta
console.log('beta present:', !!betaPlayer, 'beta pos:', betaPlayer?.entity?.position ? lib.fmt(betaPlayer.entity.position) : 'unknown/too far')

const logs = lib.find('*_log', { maxDistance: 32, count: 5 })
console.log('nearby logs count:', logs.length)
if (logs.length > 0) {
  console.log('nearest log at:', lib.fmt(logs[0].position))
}

const coal = lib.find('coal_ore', { maxDistance: 32, count: 3 })
console.log('nearby coal:', coal.length)

console.log('alpha pos:', lib.fmt(bot.entity.position))
return {
  beta: !!betaPlayer,
  pos: bot.entity.position,
  logs: logs.length
}
