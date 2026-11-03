// programs/508-scan-surroundings.js
console.log('=== GAMMA: SCAN SURROUNDINGS AT COVERED TUNNEL ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Scan all entities within 48m
const entities = Object.values(bot.entities).filter(e => e && e.isValid && e.id !== bot.entity.id);

console.log(`Total entities detected within tracking range: ${entities.length}`);

const piglins = entities.filter(e => e.name === 'piglin' || e.name === 'piglin_brute' || e.name === 'zombified_piglin');
console.log(`--- PIGLINS (${piglins.length}) ---`);
for (const p of piglins) {
  const dist = bot.entity.position.distanceTo(p.position).toFixed(1);
  console.log(`- ${p.name} at ${lib.fmt(p.position)}, dist: ${dist}m`);
}

const endermen = entities.filter(e => e.name === 'enderman');
console.log(`--- ENDERMEN (${endermen.length}) ---`);
for (const em of endermen) {
  const dist = bot.entity.position.distanceTo(em.position).toFixed(1);
  console.log(`- enderman at ${lib.fmt(em.position)}, dist: ${dist}m`);
}

const blazes = entities.filter(e => e.name === 'blaze');
console.log(`--- BLAZES (${blazes.length}) ---`);
for (const b of blazes) {
  const dist = bot.entity.position.distanceTo(b.position).toFixed(1);
  console.log(`- blaze at ${lib.fmt(b.position)}, dist: ${dist}m`);
}

const players = entities.filter(e => e.type === 'player');
console.log(`--- TEAMMATES (${players.length}) ---`);
for (const pl of players) {
  const dist = bot.entity.position.distanceTo(pl.position).toFixed(1);
  console.log(`- player ${pl.username} at ${lib.fmt(pl.position)}, dist: ${dist}m`);
}

const items = entities.filter(e => e.name === 'item');
console.log(`--- DROPPED ITEMS (${items.length}) ---`);
for (const it of items) {
  const dist = bot.entity.position.distanceTo(it.position).toFixed(1);
  console.log(`- item at ${lib.fmt(it.position)}, dist: ${dist}m`);
}

// 2. Scan for nearby nether_gold_ore
const goldOre = bot.findBlocks({
  matching: mcData.blocksByName.nether_gold_ore ? mcData.blocksByName.nether_gold_ore.id : -1,
  maxDistance: 24,
  count: 10
});
console.log(`--- NETHER GOLD ORE BLOCKS (${goldOre.length}) ---`);
for (const g of goldOre) {
  console.log(`- nether_gold_ore at ${lib.fmt(g)} (dist: ${bot.entity.position.distanceTo(g).toFixed(1)}m)`);
}

// 3. Scan for nearby chests or containers
const chests = bot.findBlocks({
  matching: b => b && (b.name === 'chest' || b.name === 'trapped_chest' || b.name === 'barrel'),
  maxDistance: 24,
  count: 5
});
console.log(`--- CHESTS/CONTAINERS (${chests.length}) ---`);
for (const c of chests) {
  console.log(`- ${bot.blockAt(c).name} at ${lib.fmt(c)}`);
}

return {
  piglins: piglins.map(p => ({ name: p.name, pos: p.position, dist: bot.entity.position.distanceTo(p.position) })),
  endermen: endermen.map(e => ({ pos: e.position, dist: bot.entity.position.distanceTo(e.position) })),
  goldOreCount: goldOre.length,
  teammates: players.map(p => ({ name: p.username, pos: p.position }))
};
