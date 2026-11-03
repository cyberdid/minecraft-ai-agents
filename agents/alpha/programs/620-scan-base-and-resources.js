// programs/620-scan-base-and-resources.js
console.log('=== Program 620: Scan Base & Resources ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check chest and block above chest
const chestPos = new Vec3(293, 72, -57);
const blockAboveChest = bot.blockAt(chestPos.offset(0, 1, 0));
console.log('Chest at', lib.fmt(chestPos), 'type:', bot.blockAt(chestPos)?.name);
console.log('Block above chest at', lib.fmt(chestPos.offset(0, 1, 0)), 'type:', blockAboveChest?.name);

// 2. Scan all blocks in 8m radius
const blockTypes = {};
for (let dx = -8; dx <= 8; dx++) {
  for (let dy = -2; dy <= 4; dy++) {
    for (let dz = -8; dz <= 8; dz++) {
      const p = bot.entity.position.offset(dx, dy, dz);
      const b = bot.blockAt(p);
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        blockTypes[b.name] = (blockTypes[b.name] || 0) + 1;
      }
    }
  }
}
console.log('Nearby blocks in 8m:', blockTypes);

// 3. Scan entities within 32m (animals, items, players)
const entities = Object.values(bot.entities).filter(e => e !== bot.entity && bot.entity.position.distanceTo(e.position) < 32);
console.log(`Entities within 32m: ${entities.length}`);
for (const e of entities) {
  const dist = bot.entity.position.distanceTo(e.position).toFixed(1);
  console.log(`- ${e.name} (${e.type}) at ${lib.fmt(e.position)} dist ${dist}m`);
}
