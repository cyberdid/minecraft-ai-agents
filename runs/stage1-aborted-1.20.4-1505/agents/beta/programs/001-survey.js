// programs/001-survey.js
bot.chat('beta online at ' + lib.fmt(bot.entity.position) + '. Surveying surroundings.')

const alpha = bot.players.alpha
const alphaPos = alpha && alpha.entity ? lib.fmt(alpha.entity.position) : 'not near/unspawned'

const logs = lib.find('*_log', { maxDistance: 64, count: 5 }).map(b => `${b.name} at ${lib.fmt(b.position)}`)
const coal = lib.find('coal_ore', { maxDistance: 64, count: 5 }).map(b => lib.fmt(b.position))
const iron = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 64, count: 5 }).map(b => lib.fmt(b.position))

const animals = Object.values(bot.entities)
  .filter(e => ['cow', 'sheep', 'pig', 'chicken'].includes(e.name))
  .slice(0, 5)
  .map(e => `${e.name} at ${lib.fmt(e.position)}`)

return {
  me: lib.fmt(bot.entity.position),
  alpha: alphaPos,
  logs,
  coal,
  iron,
  animals,
  time: lib.time()
}
