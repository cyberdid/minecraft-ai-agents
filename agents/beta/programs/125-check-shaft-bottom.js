for (let y = 55; y <= 62; y++) {
  const b = bot.blockAt(new Vec3(345, y, -32))
  console.log(`(345,${y},-32) = ${b ? b.name : 'null'}`)
}
