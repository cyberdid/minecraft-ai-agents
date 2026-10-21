// programs/029-plan-blueprint.js
// Blueprint planning and nighttime status check

const site = { x: 10, y: 67, z: -25 }
const house = lib.shapes.house({
  ...site,
  width: 5,
  depth: 5,
  height: 3,
  wall: 'cobblestone',
  roof: 'oak_planks',
  door: 'south',
  windows: true
})

globalThis.site = site
globalThis.blueprint = house

const mat = lib.materials(house)
console.log('Blueprint materials needed:', JSON.stringify(mat.need))

// Check time and safety
const t = lib.time()
console.log(`TIME: ${t.timeOfDay} (${t.phase}) | canSleep: ${t.canSleep}`)

const h = lib.hostiles(16)
console.log(`Hostiles nearby: ${h.length}`)
for (const mob of h) {
  console.log(`- ${mob.name} at ${mob.pos} dist: ${mob.dist}`)
}

// Check beta
const beta = bot.players.beta?.entity
if (beta) {
  console.log('Beta pos:', lib.fmt(beta.position))
} else {
  console.log('Beta not visible')
}

return { time: t, need: mat.need, hostiles: h.length }
