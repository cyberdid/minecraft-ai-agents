// Check column at (291, y, -56) from y=72 down to y=53
const b = bot
console.log('Inspecting column (291, y, -56):')
for (let y = 72; y >= 52; y--) {
  const bl = b.blockAt(new Vec3(291, y, -56))
  console.log(`  y=${y}:`, bl?.name)
}
