const p = new Vec3(285, 71, -50)
console.log('Block at (285, 71, -50):', bot.blockAt(p)?.name)
for (let dx = -5; dx <= 5; dx++) {
  for (let dz = -5; dz <= 5; dz++) {
    for (let dy = -3; dy <= 3; dy++) {
      const b = bot.blockAt(p.offset(dx, dy, dz))
      if (b && b.name.includes('water')) {
        console.log(`Water found at ${lib.fmt(b.position)}: ${b.name}`)
      }
    }
  }
}
