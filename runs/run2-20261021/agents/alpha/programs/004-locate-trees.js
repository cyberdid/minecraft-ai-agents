// programs/004-locate-trees.js
bot.chat("beta: Surveyed site (6..14, -29..-21): flat at y=66! Looking for surface trees.")

const p = bot.entity.position
console.log('alpha at:', lib.fmt(p))

// Search for any log blocks where y >= 60
const logs = []
const logIds = Object.keys(mcData.blocksByName).filter(k => k.endsWith('_log')).map(k => mcData.blocksByName[k].id)
const blockPositions = bot.findBlocks({
  matching: logIds,
  maxDistance: 128,
  count: 30
})

for (const bp of blockPositions) {
  if (bp.y >= 60) {
    logs.push(bp)
  }
}

console.log(`Found ${logs.length} surface logs out of ${blockPositions.length} logs total`)
if (logs.length > 0) {
  for (const l of logs.slice(0, 5)) {
    const bl = bot.blockAt(l)
    console.log(`log ${bl?.name} at ${lib.fmt(l)} dist: ${Math.round(p.distanceTo(l))}`)
  }
} else {
  console.log('No surface logs within 128m. Finding exposed terrain / trees / leaves...')
  // check for leaves
  const leafIds = Object.keys(mcData.blocksByName).filter(k => k.endsWith('_leaves')).map(k => mcData.blocksByName[k].id)
  const leaves = bot.findBlocks({ matching: leafIds, maxDistance: 128, count: 10 })
  console.log('leaves found:', leaves.length)
  if (leaves.length > 0) {
    console.log('first leaf at:', lib.fmt(leaves[0]))
  }
}

return { surfaceLogs: logs.length }
