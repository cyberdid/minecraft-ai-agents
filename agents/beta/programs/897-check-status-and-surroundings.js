console.log('=== Program 897: Check Status & Surroundings ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Position:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// List all players
for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}, dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}`);
  } else {
    console.log(`Player ${p.username} (entity not loaded)`);
  }
}

// Check Nether Portal blocks nearby
const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 32,
  count: 10
});
console.log(`Nearby nether_portal blocks: ${portals.length}`);
for (const p of portals) {
  console.log(`  Portal block at ${lib.fmt(p)}`);
}

// Check obsidian frame near (46, 66, 2)
const obs = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 32,
  count: 20
});
console.log(`Nearby obsidian blocks: ${obs.length}`);

// Check Endermen and Piglins nearby
const mobs = Object.values(bot.entities).filter(e =>
  e.isValid && (e.name === 'enderman' || e.name === 'piglin' || e.name === 'piglin_brute')
);
console.log(`Nearby Endermen / Piglins: ${mobs.length}`);
for (const m of mobs) {
  console.log(`  ${m.name} at ${lib.fmt(m.position)}, dist: ${bot.entity.position.distanceTo(m.position).toFixed(1)}`);
}

return { dimension: bot.game.dimension, portals: portals.length, obs: obs.length, mobs: mobs.length };
