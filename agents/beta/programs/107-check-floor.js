for (let z = -32; z <= -28; z++) {
  for (let x = 348; x <= 351; x++) {
    const p = new Vec3(x, -55, z)
    const b = bot.blockAt(p)
    const below = bot.blockAt(p.offset(0, -1, 0))
    console.log(`(${x},-55,${z}) = ${b ? b.name : 'null'} | below: ${below ? below.name : 'null'}`)
  }
}
