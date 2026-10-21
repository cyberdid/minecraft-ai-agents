for (let y = 62; y <= 66; y++) {
  for (let x = 347; x <= 349; x++) {
    for (let z = -32; z <= -30; z++) {
      const p = new Vec3(x, y, z)
      const b = bot.blockAt(p)
      if (b && b.name !== 'air') {
        console.log(`(${x},${y},${z}) = ${b.name}`)
      }
    }
  }
}
