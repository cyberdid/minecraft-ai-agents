// 008-check-enclosure.js - inspect walls & roof of base, make sure we are 100% enclosed
const alpha = bot.players.alpha?.entity?.position
console.log('Alpha at:', alpha ? lib.fmt(alpha) : 'unknown')
console.log('Beta at:', lib.fmt(bot.entity.position))

// Check open air blocks at y=72, y=73, y=74 around perimeter
const perimeter = []
for (let x = 292; x <= 296; x++) {
  perimeter.push({ x, z: -58 })
  perimeter.push({ x, z: -54 })
}
for (let z = -57; z <= -55; z++) {
  perimeter.push({ x: 292, z })
  perimeter.push({ x: 296, z })
}

const missingWall = []
for (const p of perimeter) {
  for (let y = 72; y <= 74; y++) {
    // Door is at 294, 72-73, -54
    if (p.x === 294 && p.z === -54 && (y === 72 || y === 73)) continue
    const b = lib.blockAt(p.x, y, p.z)
    if (!b || b.boundingBox !== 'block') {
      missingWall.push(`(${p.x}, ${y}, ${p.z})=${b?.name}`)
    }
  }
}
console.log('Missing wall blocks (up to y=74):', missingWall.length, missingWall.slice(0, 10))

// Check roof at y=75 over interior (293..295, -57..-55)
const missingRoof = []
for (let x = 293; x <= 295; x++) {
  for (let z = -57; z <= -55; z++) {
    const b = lib.blockAt(x, 75, z)
    if (!b || b.boundingBox !== 'block') {
      missingRoof.push(`(${x}, 75, ${z})=${b?.name}`)
    }
  }
}
console.log('Missing roof interior (y=75):', missingRoof.length, missingRoof)

// Check door state
const doorBlock = lib.blockAt(294, 72, -54)
console.log('Door at (294, 72, -54):', doorBlock?.name)

// If missing roof over inside, can we place planks overhead at y=75 or y=74?
if (missingRoof.length > 0 && lib.count('oak_planks') > 0) {
  console.log('Placing planks for roof over interior...')
  for (let x = 293; x <= 295; x++) {
    for (let z = -57; z <= -55; z++) {
      if (lib.count('oak_planks') === 0) break
      const b = lib.blockAt(x, 75, z)
      if (!b || b.boundingBox !== 'block') {
        try {
          await lib.place('oak_planks', x, 75, z)
        } catch (e) {
          // might not have support yet, try y=74 if needed
        }
      }
    }
  }
}

console.log('Time:', lib.time())
console.log('Hostiles:', lib.hostiles(16))
