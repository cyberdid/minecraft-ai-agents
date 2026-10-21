console.log('Inspecting path from (344, 62, -32) to (350, 66, -30)...')
for (let x = 344; x <= 350; x++) {
  for (let z = -33; z <= -30; z++) {
    for (let y = 61; y <= 67; y++) {
      const p = new Vec3(x, y, z)
      const b = bot.blockAt(p)
      if (b && b.name !== 'air' && b.name !== 'dirt' && b.name !== 'stone') {
        console.log(`(${x},${y},${z}) = ${b.name}`)
      }
    }
  }
}
