console.log('=== Inspect Blocks Above Beta ===')
console.log('Beta pos:', lib.fmt(bot.entity.position))

for (let y = 48; y <= 75; y++) {
  const b = bot.blockAt(new Vec3(295, y, -49))
  if (b && b.name !== 'stone' && b.name !== 'deepslate') {
    console.log(`y=${y}: ${b.name}`)
  }
}

// Find highest solid block at (295, -49)
let surfaceY = 80
while (surfaceY > 40 && bot.blockAt(new Vec3(295, surfaceY, -49))?.boundingBox !== 'block') {
  surfaceY--
}
console.log(`Surface solid height at (295, -49) is y=${surfaceY}`)
