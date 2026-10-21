// Survey 9x9 around (-10, 2)
const [x0, z0] = [-10, 2]
const rows = []
const heights = []
for (let z = z0; z < z0 + 9; z++) {
  let row = ''
  for (let x = x0; x < x0 + 9; x++) {
    let y = 80
    while (y > 50 && lib.blockAt(x, y, z).boundingBox !== 'block') y--
    row += String(y).padStart(4)
    heights.push(y)
  }
  rows.push(`z=${z}:${row}`)
}
console.log('Site heights:')
console.log(rows.join('\n'))

// Find most common height
const counts = {}
for (const h of heights) counts[h] = (counts[h] || 0) + 1
console.log('Height distribution:', JSON.stringify(counts))

// Check blocks at surface
const sampleBlock = lib.blockAt(x0, heights[0], z0)
console.log(`Surface sample at (${x0}, ${heights[0]}, ${z0}):`, sampleBlock.name)

return { counts }
