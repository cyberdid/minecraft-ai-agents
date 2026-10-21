// programs/010-check-beta.js
const p = bot.entity.position
console.log('alpha at:', lib.fmt(p))

const allEntities = Object.values(bot.entities)
const animals = allEntities.filter(e => ['cow', 'pig', 'sheep', 'chicken', 'rabbit'].includes(e.name))
console.log(`Passive animals loaded: ${animals.length}`)
for (const a of animals.slice(0, 5)) {
  console.log(`- ${a.name} at ${lib.fmt(a.position)} (dist: ${Math.round(p.distanceTo(a.position))})`)
}

const beta = bot.players.beta?.entity
if (beta) {
  console.log(`beta is at ${lib.fmt(beta.position)} (dist: ${Math.round(p.distanceTo(beta.position))})`)
} else {
  console.log('beta entity is not in loaded chunks')
}

// Let's also check exposed stone nearby
const stone = bot.findBlocks({ matching: mcData.blocksByName.stone.id, maxDistance: 32, count: 5 })
console.log('exposed stone nearby:', stone.length)
if (stone.length > 0) {
  console.log('first stone at:', lib.fmt(stone[0]))
}

return { animals: animals.length, betaNearby: !!beta }
