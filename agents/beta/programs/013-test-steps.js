// Descend steps 1 to 5
for (let i = 1; i <= 5; i++) {
  const target = new Vec3(367 - i, -38 - i, -30)
  console.log(`Starting step ${i} to ${target}`)
  // Dig head, body, feet
  for (const dy of [2, 1, 0]) {
    const pos = target.offset(0, dy, 0)
    const bl = bot.blockAt(pos)
    if (bl && bl.boundingBox === 'block') {
      await lib.dig(pos.x, pos.y, pos.z)
    }
  }
  // Check floor
  const under = bot.blockAt(target.offset(0, -1, 0))
  if (!under || under.boundingBox !== 'block') {
    await lib.place('cobblestone', target.x, target.y - 1, target.z)
  }
  // Walk to target
  await lib.walkTo(target.x + 0.5, target.z + 0.5, 3000)
  await sleep(200)
  console.log(`Step ${i} complete, position now:`, bot.entity.position)
}
