for (let y = 65; y <= 76; y++) {
  const b = bot.blockAt(new Vec3(345, y, -32))
  console.log(`(345,${y},-32) = ${b ? b.name : 'null'}`)
}
