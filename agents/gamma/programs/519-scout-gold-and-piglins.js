// programs/519-scout-gold-and-piglins.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== GAMMA: SCOUT GOLD & PIGLINS ===');
console.log('Current Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Check all entities within 48m
const piglins = [];
const endermen = [];
const otherMobs = [];
for (const e of Object.values(bot.entities)) {
  if (!e.isValid || e === bot.entity) continue;
  const d = bot.entity.position.distanceTo(e.position);
  if (d > 48) continue;
  if (e.name === 'piglin') piglins.push({ id: e.id, pos: e.position, dist: d });
  else if (e.name === 'enderman') endermen.push({ id: e.id, pos: e.position, dist: d });
  else if (e.type === 'mob') otherMobs.push({ name: e.name, pos: e.position, dist: d });
}

console.log(`Piglins found within 48m: ${piglins.length}`);
for (const p of piglins) {
  console.log(`  Piglin at ${lib.fmt(p.pos)} (dist: ${p.dist.toFixed(1)}m)`);
}

console.log(`Endermen found within 48m: ${endermen.length}`);
for (const em of endermen) {
  console.log(`  Enderman at ${lib.fmt(em.pos)} (dist: ${em.dist.toFixed(1)}m)`);
}

console.log(`Other mobs within 48m: ${otherMobs.length}`);
for (const om of otherMobs) {
  console.log(`  ${om.name} at ${lib.fmt(om.pos)} (dist: ${om.dist.toFixed(1)}m)`);
}

// 2. Find nether_gold_ore blocks within 32m
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_block'),
  maxDistance: 32,
  count: 20
});

console.log(`Nether gold ores found within 32m: ${goldOres.length}`);
for (const p of goldOres) {
  const d = bot.entity.position.distanceTo(p);
  console.log(`  Ore at ${lib.fmt(p)} (dist: ${d.toFixed(1)}m)`);
}

// 3. Check covered tunnel forward towards z=-145
const tunnelPos = new Vec3(44, 65, -145);
console.log(`Distance to covered tunnel (44, 65, -145): ${bot.entity.position.distanceTo(tunnelPos).toFixed(1)}m`);

return {
  hp: bot.health,
  food: bot.food,
  piglinsCount: piglins.length,
  endermenCount: endermen.length,
  goldOresCount: goldOres.length,
  piglins,
  goldOres: goldOres.map(p => ({ x: p.x, y: p.y, z: p.z }))
};
