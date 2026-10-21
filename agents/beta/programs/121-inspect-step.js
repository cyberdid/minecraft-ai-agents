for (let y = 61; y <= 65; y++) {
  for (let x = 344; x <= 347; x++) {
    const p = new Vec3(x, y, -32)
    const b = bot.blockAt(p)
    console.log(`(${x},${y},-32) = ${b ? b.name : 'null'}`)
  }
}
