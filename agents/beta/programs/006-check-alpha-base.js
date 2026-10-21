// 006-check-alpha-base.js
const alpha = bot.players.alpha?.entity?.position
console.log('Alpha at:', alpha ? lib.fmt(alpha) : 'not visible')

// Check block above beta's head
const aboveHead = lib.blockAt(288, 73, -58)
console.log('Block above head at (288, 73, -58):', aboveHead?.name)

// Check base site at 292, 72, -58
const baseBlocks = []
for (let dx = 0; dx <= 4; dx++) {
  for (let dz = 0; dz <= 4; dz++) {
    const b = lib.blockAt(292 + dx, 72, -58 + dz)
    if (b && b.name !== 'air') {
      baseBlocks.push(`${b.name} at (${292+dx}, 72, ${-58+dz})`)
    }
  }
}
console.log('Base blocks at y=72:', baseBlocks.length, baseBlocks.slice(0, 5))

// Also craft door and chest if we haven't yet
if (lib.count('*_door') === 0 && lib.count('*_planks') >= 6) {
  await lib.craft('oak_door', 3)
}
if (lib.count('chest') === 0 && lib.count('*_planks') >= 8) {
  await lib.craft('chest', 1)
}
console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time:', lib.time())
