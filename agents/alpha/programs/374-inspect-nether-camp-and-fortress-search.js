// programs/374-inspect-nether-camp-and-fortress-search.js
console.log('=== Program 374: Nether Camp Inspection & Fortress Recon ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Locate teammates in the Nether
console.log('--- Teammates in Nether ---');
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`  ${name}: at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  } else {
    console.log(`  ${name}: not loaded or in Overworld`);
  }
}

// 2. Inspect Nether portal blocks & bunker perimeter
const portalBlocks = bot.findBlocks({
  matching: (b) => b && b.name === 'nether_portal',
  maxDistance: 8,
  count: 10
});
console.log(`Nether portal blocks found: ${portalBlocks.length}`);
for (const pb of portalBlocks) {
  console.log(`  Portal block at: ${lib.fmt(pb)}`);
}

// Check cobblestone bunker surrounding the portal
const cobbleBlocks = bot.findBlocks({
  matching: (b) => b && b.name === 'cobblestone',
  maxDistance: 10,
  count: 64
});
console.log(`Bunker cobblestone blocks placed: ${cobbleBlocks.length}`);

// 3. Scan for Nether Fortress blocks within 64 blocks
const fortressBlocks = bot.findBlocks({
  matching: (b) => b && (b.name.includes('nether_brick') || b.name.includes('spawner')),
  maxDistance: 64,
  count: 10
});
console.log(`Fortress blocks detected: ${fortressBlocks.length}`);
for (const fb of fortressBlocks) {
  console.log(`  Fortress block: ${bot.blockAt(fb)?.name} at ${lib.fmt(fb)}`);
}

// 4. Scan for gold ore and biomes/blocks
const goldOres = bot.findBlocks({
  matching: (b) => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone'),
  maxDistance: 32,
  count: 10
});
console.log(`Nether gold ores found nearby: ${goldOres.length}`);

// 5. Scan for nearby entities in Nether
console.log('--- Nearby Entities in Nether ---');
const entities = Object.values(bot.entities).filter(e => 
  e && e.position && bot.entity.position.distanceTo(e.position) < 32 && e.id !== bot.entity.id
);
for (const e of entities) {
  console.log(`  ${e.name || e.type} at ${lib.fmt(e.position)}, dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}m`);
}

bot.chat(`team: Alpha at Nether camp (40, 65, -7). Bunker cobble: ${cobbleBlocks.length}. Fortress scan: ${fortressBlocks.length} blocks found. Gold ore: ${goldOres.length}.`);

console.log('Alpha status:', JSON.stringify(lib.status()));
