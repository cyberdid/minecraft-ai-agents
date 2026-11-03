// programs/731-inspect-and-slay.js
console.log('=== Program 731: Inspect Pillbox Surroundings & Combat ===');
console.log('Bot pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// List all entities within 12 blocks
const nearby = Object.values(bot.entities)
  .filter(e => e.isValid && bot.entity.position.distanceTo(e.position) <= 12)
  .map(e => ({
    name: e.name,
    type: e.type,
    pos: lib.fmt(e.position),
    dist: bot.entity.position.distanceTo(e.position).toFixed(2),
    hp: e.health
  }));

console.log('Nearby entities within 12m:');
for (const ent of nearby) {
  console.log(` - ${ent.name} (${ent.type}) at ${ent.pos}, dist: ${ent.dist}m, hp: ${ent.hp}`);
}

// Check if there are dropped items
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 12);
console.log(`Found ${items.length} dropped items nearby:`);
for (const it of items) {
  console.log(` - Item entity id ${it.id} at ${lib.fmt(it.position)}, dist: ${bot.entity.position.distanceTo(it.position).toFixed(2)}m`);
}

// Check blocks at the firing slit: x=35..37, y=66..68, z=-186..-188
console.log('Surrounding blocks:');
for (let x = 35; x <= 37; x++) {
  for (let y = 65; y <= 68; y++) {
    for (let z = -189; z <= -186; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        console.log(` Block at (${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}
