// programs/183-inspect-and-seal.js
console.log('Delta pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Check surrounding blocks around Delta
console.log('--- ENCLOSURE SCAN (z=-131 to -135) ---');
for (let z = -131; z >= -135; z--) {
  for (let y = 67; y >= 64; y--) {
    const bW = bot.blockAt(new Vec3(43, y, z));
    const bC = bot.blockAt(new Vec3(44, y, z));
    const bE = bot.blockAt(new Vec3(45, y, z));
    console.log(`z=${z} y=${y}: W(43)=${bW?.name} C(44)=${bC?.name} E(45)=${bE?.name}`);
  }
}

// 2. Check entities nearby (items, mobs, etc.)
console.log('--- NEARBY ENTITIES (<25m) ---');
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (!e || e === bot.entity) continue;
  const dist = bot.entity.position.distanceTo(e.position);
  if (dist < 25) {
    console.log(`Entity: ${e.name || e.type} at ${lib.fmt(e.position)}, dist=${dist.toFixed(1)}m, kind=${e.kind || 'unknown'}`);
    if (e.name === 'item' && e.metadata) {
      // try to identify item
      console.log(`  Item details:`, e.getDroppedItem?.() || 'unknown item');
    }
  }
}
