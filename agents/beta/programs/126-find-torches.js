// Flood-fill or trace air blocks from (340, 75, -30) downwards
const start = new Vec3(340, 75, -30)
console.log('Start block at (340, 75, -30):', bot.blockAt(start)?.name)
console.log('Block at (340, 74, -30):', bot.blockAt(start.offset(0, -1, 0))?.name)
console.log('Block at (340, 73, -30):', bot.blockAt(start.offset(0, -2, 0))?.name)
console.log('Block at (340, 72, -30):', bot.blockAt(start.offset(0, -3, 0))?.name)

// Let's check torches nearby! Torches mark the staircase!
const torches = bot.findBlocks({
  matching: b => b.name === 'torch' || b.name === 'wall_torch',
  maxDistance: 64,
  count: 30
})
console.log(`Found ${torches.length} torches:`)
for (const t of torches) {
  console.log(`Torch at (${t.x}, ${t.y}, ${t.z})`)
}
