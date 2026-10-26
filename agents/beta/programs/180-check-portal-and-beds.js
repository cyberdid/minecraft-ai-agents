console.log('=== Checking Beds & Portal Site ===')
const bed1 = bot.blockAt(new Vec3(293, 72, -56))
const bed2 = bot.blockAt(new Vec3(294, 72, -56))
console.log('Bed 1 at (293, 72, -56):', bed1?.name)
console.log('Bed 2 at (294, 72, -56):', bed2?.name)

// Portal site check: (298, 72, -54)
console.log('Checking portal site (298, 72, -54):')
for (let dx = 0; dx < 4; dx++) {
  for (let dy = 0; dy < 5; dy++) {
    const p = new Vec3(298 + dx, 72 + dy, -54)
    const b = bot.blockAt(p)
    if (b && b.name !== 'air') {
      console.log(`  Block at ${lib.fmt(p)}: ${b.name}`)
    }
  }
}

// Alpha check
const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log('Alpha at:', lib.fmt(alpha.entity.position), 'dist:', alpha.entity.position.distanceTo(bot.entity.position).toFixed(1))
} else {
  console.log('Alpha entity not loaded')
}

// Ensure spawn is set
try {
  await lib.setSpawn()
  console.log('Spawn set successfully!')
} catch (e) {
  console.log('setSpawn notice:', e.message)
}
