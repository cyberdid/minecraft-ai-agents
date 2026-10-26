// Step 1: Check door
const doorPos = new Vec3(294, 72, -54)
console.log('Door block at (294, 72, -54):', lib.blockAt(doorPos.x, doorPos.y, doorPos.z)?.name)

// Step 2: Exit through door
await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z)
console.log('Stepped outside, beta at:', lib.fmt(bot.entity.position))

// Step 3: Find surface water near (285, 71, -50)
const waterSources = bot.findBlocks({
  matching: b => b && b.name === 'water' && b.position.y >= 68,
  maxDistance: 32,
  count: 5
})
console.log('Surface water blocks:', waterSources.map(p => lib.fmt(p)))

if (waterSources.length > 0) {
  const target = waterSources[0]
  await lib.goTo(target.x, target.y + 1, target.z, 2)
  console.log('Near water at:', lib.fmt(bot.entity.position))
  await lib.fillBucket('water')
  console.log('Bucket filled! water_bucket count:', lib.count('water_bucket'))
} else {
  console.log('No surface water found within 32 blocks at y>=68')
}

// Return to near base door
await lib.goTo(294, 72, -53, 1)
console.log('Back outside door at:', lib.fmt(bot.entity.position))
