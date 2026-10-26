// programs/290-scan-animals-and-shaft.js
console.log('=== SCAN ANIMALS & SHAFT ===');

// 1. Scan for animals within 80 blocks
const animals = Object.values(bot.entities).filter(e => {
  if (!e || !e.name) return false;
  return ['cow', 'pig', 'sheep', 'chicken'].includes(e.name);
});
console.log(`Animals found (${animals.length}):`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)} (dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m)`);
}

// 2. Scan mine shaft from y=71 down to y=20 at (302, y, -44)
console.log('Inspecting shaft descent around (302, y, -44)...');
let shaftOres = [];
for (let y = 71; y >= 20; y--) {
  // check 3x3 around shaft at height y
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      const p = new Vec3(302 + dx, y, -44 + dz);
      const b = bot.blockAt(p);
      if (b && (b.name === 'iron_ore' || b.name === 'coal_ore' || b.name.includes('ore'))) {
        shaftOres.push(`${b.name} at ${lib.fmt(p)}`);
      }
    }
  }
}
console.log(`Ores in shaft walls (${shaftOres.length}):`, shaftOres.slice(0, 10));

// 3. Check beta and delta items
for (const name of ['beta', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    const held = p.entity.heldItem;
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} holding: ${held ? `${held.name}x${held.count}` : 'nothing'}`);
  }
}
