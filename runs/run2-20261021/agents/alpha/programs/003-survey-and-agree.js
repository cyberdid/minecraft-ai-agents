// programs/003-survey-and-agree.js
bot.chat("beta: Sounds good! 7x7 house at (10, 67, -25). I will survey the site, gather food/wool and more wood/dirt.")

// Survey 9x9 area centered around (10, -25), so x: 6..14, z: -29..-21
const [x0, z0] = [6, -29]
const rows = []
const heightCounts = {}
for (let z = z0; z <= z0 + 8; z++) {
  let row = ''
  for (let x = x0; x <= x0 + 8; x++) {
    let y = 90
    while (y > 40 && lib.blockAt(x, y, z).boundingBox !== 'block') y--
    row += String(y).padStart(4)
    heightCounts[y] = (heightCounts[y] || 0) + 1
  }
  rows.push(`z=${z}:${row}`)
}
console.log('Site heights (6..14, -29..-21):')
console.log(rows.join('\n'))
console.log('Height distribution:', JSON.stringify(heightCounts))

// Surface logs
const surfaceLogs = bot.findBlocks({
  matching: b => b.name.endsWith('_log') && b.position.y >= 60,
  maxDistance: 128,
  count: 10
})
console.log('surface logs found:', surfaceLogs.length)
if (surfaceLogs.length > 0) {
  console.log('first 3 surface logs:', surfaceLogs.slice(0, 3).map(p => lib.fmt(p)))
}

// Check sheep within 64m
const sheep = Object.values(bot.entities).filter(e => e.name === 'sheep')
console.log('nearby sheep:', sheep.length)
if (sheep.length > 0) {
  console.log('nearest sheep:', lib.fmt(sheep[0].position))
}

return { heights: heightCounts, surfaceLogs: surfaceLogs.length, sheep: sheep.length }
