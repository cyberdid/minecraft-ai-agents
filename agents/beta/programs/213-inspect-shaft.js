console.log('=== Inspecting shaft at (309, 65, -65) ===')
for (let y = 65; y >= 45; y--) {
  const b = bot.blockAt(new Vec3(309, y, -65))
  console.log(`(309, ${y}, -65): ${b?.name}`)
}

// Check if any nearby air steps
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    const b = bot.blockAt(new Vec3(309 + dx, 64, -65 + dz))
    if (b && b.name === 'air') console.log(`Step at (309+${dx}, 64, -65+${dz}): air`)
  }
}
