// programs/033-check-creeper-and-exit.js
const p = bot.entity.position
console.log('alpha at:', lib.fmt(p))

// Hostiles check
const hostiles = lib.hostiles(24)
console.log('Hostiles within 24 blocks:', hostiles.length)
for (const h of hostiles) {
  console.log(`- ${h.name} at ${h.pos} dist: ${h.dist}`)
}

// Check blocks above and around us
console.log('Block at feet (32, 63, -45):', bot.blockAt(new Vec3(32, 63, -45))?.name)
console.log('Block at head (32, 64, -45):', bot.blockAt(new Vec3(32, 64, -45))?.name)
console.log('Block at roof (32, 65, -45):', bot.blockAt(new Vec3(32, 65, -45))?.name)

for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const b = bot.blockAt(new Vec3(32 + dx, 64, -45 + dz))
  console.log(`Side (${dx}, ${dz}) at y=64: ${b?.name}`)
}

return { hostiles }
