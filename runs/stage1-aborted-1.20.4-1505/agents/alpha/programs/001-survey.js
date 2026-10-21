const status = lib.status()
console.log('STATUS:', JSON.stringify(status))

const trees = lib.find('*_log', { maxDistance: 64, count: 5 })
console.log('TREES nearby:', trees.map(t => `${t.name} at ${lib.fmt(t.position)}`).join(', ') || 'none')

const stone = lib.find('stone', { maxDistance: 32, count: 5 })
console.log('STONE nearby:', stone.length)

const beta = bot.players.beta
if (beta && beta.entity) {
  console.log('BETA at:', lib.fmt(beta.entity.position))
} else {
  console.log('BETA not in sight or offline')
}

bot.chat('alpha online at (-12, 62, 8). Surveying site and starting wood gathering.')

return { pos: status.pos, trees: trees.length }
