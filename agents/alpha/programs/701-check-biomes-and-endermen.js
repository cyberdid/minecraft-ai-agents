// programs/701-check-biomes-and-endermen.js
console.log('=== Biome and Mob Analysis ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Sample block biomes around
const offsets = [
  { name: 'here', x: 0, z: 0 },
  { name: 'North 30', x: 0, z: -30 },
  { name: 'North 60', x: 0, z: -60 },
  { name: 'North 90', x: 0, z: -90 },
  { name: 'South 30', x: 0, z: 30 },
  { name: 'South 60', x: 0, z: 60 },
  { name: 'East 30', x: 30, z: 0 },
  { name: 'East 60', x: 60, z: 0 },
  { name: 'West 30', x: -30, z: 0 },
  { name: 'West 60', x: -60, z: 0 }
];

for (const off of offsets) {
  const p = bot.entity.position.offset(off.x, 0, off.z);
  const block = bot.blockAt(p);
  const biome = block?.biome?.name || 'unknown';
  console.log(`Direction ${off.name} (${lib.fmt(p)}): biome = ${biome}`);
}

// Check all mobs within 40 blocks
const mobs = Object.values(bot.entities)
  .filter(e => e.type === 'mob' || e.name === 'enderman' || e.name === 'piglin' || e.name === 'ghast' || e.name === 'skeleton')
  .filter(e => bot.entity.position.distanceTo(e.position) <= 50);

console.log(`\nMobs within 50 blocks (${mobs.length}):`);
for (const m of mobs) {
  const dist = bot.entity.position.distanceTo(m.position).toFixed(1);
  console.log(` - ${m.name} at ${lib.fmt(m.position)} dist=${dist}m HP=${m.health}`);
}

// Check Endermen anywhere tracked
const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman');
console.log(`\nTotal tracked Endermen: ${endermen.length}`);
for (const em of endermen.slice(0, 5)) {
  console.log(` - Enderman at ${lib.fmt(em.position)} dist=${bot.entity.position.distanceTo(em.position).toFixed(1)}m`);
}
