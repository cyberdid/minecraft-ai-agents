// Place cobblestone at (350, -52, -30) to extinguish the water source
const p = new Vec3(350, -52, -30)
console.log('Placing cobblestone at', p)
await lib.place('cobblestone', p.x, p.y, p.z)
await sleep(1500)

const water = bot.findBlocks({
  matching: b => b && (b.name === 'water' || b.name === 'flowing_water'),
  maxDistance: 16,
  count: 30
})
console.log('Remaining water blocks:', water.length)
return { remainingWater: water.length }
