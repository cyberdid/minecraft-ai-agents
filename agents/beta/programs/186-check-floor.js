console.log('=== Floor and Base Check ===')
for (let x = 292; x <= 295; x++) {
  for (let z = -58; z <= -54; z++) {
    const floor = bot.blockAt(new Vec3(x, 71, z))
    const body = bot.blockAt(new Vec3(x, 72, z))
    console.log(`(${x}, ${z}): floor=${floor?.name}, body=${body?.name}`)
  }
}
