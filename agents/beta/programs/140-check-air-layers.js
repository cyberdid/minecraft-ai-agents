for (let y = 63; y <= 67; y++) {
  const line = []
  for (let x = 346; x <= 350; x++) {
    for (let z = -33; z <= -29; z++) {
      const b = bot.blockAt(new Vec3(x, y, z))
      if (b && b.name === 'air') {
        line.push(`air at (${x},${y},${z})`)
      }
    }
  }
  console.log(`y=${y}: ${line.join(', ')}`)
}
