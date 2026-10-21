for (let y = 63; y >= 50; y--) {
  const b = bot.blockAt(new Vec3(18, y, 23))
  console.log(`(18, ${y}, 23):`, b?.name)
}
