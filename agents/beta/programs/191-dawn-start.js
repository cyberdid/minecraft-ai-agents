console.log('=== Dawn Start & Animal Scan ===')
const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log(`Alpha at: ${lib.fmt(alpha.entity.position)}`)
} else {
  console.log('Alpha entity not loaded')
}

const animals = Object.values(bot.entities).filter(e => 
  e && ['sheep', 'cow', 'pig', 'chicken'].includes(e.name) &&
  e.position && e.position.distanceTo(bot.entity.position) < 80
).map(a => ({
  name: a.name,
  pos: lib.fmt(a.position),
  dist: a.position.distanceTo(bot.entity.position).toFixed(1)
}))

console.log('Animals nearby:', JSON.stringify(animals))
const hostiles = lib.hostiles(20)
console.log('Hostiles within 20:', JSON.stringify(hostiles))
