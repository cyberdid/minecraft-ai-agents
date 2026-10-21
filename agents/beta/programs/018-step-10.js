// Step 10: dig, place floor, place wall at z=-31
const target = new Vec3(357, -48, -30)
console.log('Doing step 10 to', target)

// 1. Dig head and body
for (const dy of [2, 1]) {
  const p = target.offset(0, dy, 0)
  const bl = bot.blockAt(p)
  if (bl && bl.boundingBox === 'block') {
    await lib.dig(p.x, p.y, p.z)
  }
}

// 2. Place wall at z=-31 before digging feet, so wall has solid block to place against!
const wall1 = new Vec3(target.x, target.y + 1, -31)
const wall2 = new Vec3(target.x, target.y, -31)
console.log('Placing wall blocks at z=-31...')
await lib.place('cobblestone', wall2.x, wall2.y, wall2.z).catch(e => console.log('wall2 error:', e.message))
await lib.place('cobblestone', wall1.x, wall1.y, wall1.z).catch(e => console.log('wall1 error:', e.message))

// 3. Dig feet
const blFeet = bot.blockAt(target)
if (blFeet && blFeet.boundingBox === 'block') {
  await lib.dig(target.x, target.y, target.z)
}

// 4. Place floor under feet
console.log('Placing floor...')
await lib.place('cobblestone', target.x, target.y - 1, target.z).catch(e => console.log('floor error:', e.message))

// 5. Walk onto target
await lib.walkTo(target.x + 0.5, target.z + 0.5, 3000)
console.log('At position:', bot.entity.position)
