console.log('=== Checking Staircase Entrance at (311, 65, -65) ===')
await lib.goTo(311, 65, -65, 2)
console.log('At (311, 65, -65). Inspecting blocks below:')
for (let y = 67; y >= 40; y--) {
  const b = bot.blockAt(new Vec3(311, y, -65))
  if (b && b.name === 'air') {
    console.log(`y=${y}: AIR at (311, ${y}, -65)`)
  }
}

// Also check surrounding blocks at y=65
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    const p = new Vec3(311 + dx, 65, -65 + dz)
    const b = bot.blockAt(p)
    if (b && b.name === 'air') {
      console.log(`Air opening at ${lib.fmt(p)}`)
    }
  }
}
