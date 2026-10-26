// programs/219-scan-surroundings.js
console.log('=== GAMMA SURROUNDINGS SCAN ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

// 1. Teammates
console.log('\n--- TEAMMATES ---');
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username) {
    const ent = p.entity;
    if (ent) {
      console.log(`${p.username}: pos=${lib.fmt(ent.position)} dist=${bot.entity.position.distanceTo(ent.position).toFixed(1)}m held=${ent.heldItem?.name || 'none'}`);
    } else {
      console.log(`${p.username}: far/offline`);
    }
  }
}

// 2. Hostiles
console.log('\n--- HOSTILES ---');
const hostiles = lib.hostiles(32);
console.log(`Hostiles (${hostiles.length}):`);
for (const h of hostiles) {
  const e = bot.entities[h.id];
  if (e) {
    console.log(` - ${e.name} at ${lib.fmt(e.position)} (dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)}m, hp: ${e.health})`);
  }
}

// 3. Dropped items
console.log('\n--- DROPPED ITEMS ---');
const dropped = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 32);
console.log(`Dropped items (${dropped.length}):`);
for (const item of dropped) {
  console.log(` - Item entity ${item.id} at ${lib.fmt(item.position)} (dist: ${bot.entity.position.distanceTo(item.position).toFixed(1)}m)`);
}

// 4. Floor inspection along x=44 from z=-170 to z=-192
console.log('\n--- FLOOR SCAN along x=44, y=64 ---');
for (let z = -170; z >= -192; z--) {
  const b = bot.blockAt(new Vec3(44, 64, z));
  const bAbove = bot.blockAt(new Vec3(44, 65, z));
  console.log(`(44, 64, ${z}): ${b ? b.name : 'null'} | above: ${bAbove ? bAbove.name : 'null'}`);
}

// 5. Check spawner area around (32, 68, -190)
console.log('\n--- SPAWNER BALCONY BLOCKS around (32, 68, -190) ---');
for (let dx = -3; dx <= 3; dx++) {
  for (let dz = -3; dz <= 3; dz++) {
    const p = new Vec3(32 + dx, 68, -190 + dz);
    const b = bot.blockAt(p);
    if (b && b.name !== 'air' && b.name !== 'nether_bricks') {
      console.log(`Block at ${lib.fmt(p)}: ${b.name}`);
    }
  }
}
const spawnerBlock = bot.blockAt(new Vec3(32, 68, -190));
console.log(`Block at (32, 68, -190): ${spawnerBlock ? spawnerBlock.name : 'null'}`);

// 6. Nearby netherrack blocks within 5m
const netherrack = bot.findBlocks({
  matching: b => b && b.name === 'netherrack',
  maxDistance: 6,
  count: 10
});
console.log(`Nearby netherrack blocks within 6m (${netherrack.length}):`, netherrack.map(p => lib.fmt(p)));
