// programs/064-scan-wood-or-ascend.js
// Check if any wood/planks/shaft nearby, else return staircase status

const wood = lib.find(['*_planks', '*_log', '*_fence', 'chest'], { maxDistance: 32 })
console.log('Found wood blocks within 32m:', wood.map(w => `${w.name} at ${lib.fmt(w.position)}`))

const items = bot.entities ? Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 32) : []
console.log('Nearby dropped items:', items.map(i => `${i.name} at ${lib.fmt(i.position)}`))

console.log('Beta pos:', lib.fmt(bot.entity.position))
console.log('Time:', lib.time().time, '| phase:', lib.time().phase)

return { wood: wood.length, items: items.length }
