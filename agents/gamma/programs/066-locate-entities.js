// programs/066-locate-entities.js
console.log('--- SCANNING NEARBY ENTITIES ---');
const entities = Object.values(bot.entities)
  .filter(e => e && e.position && e.name !== 'player' && e.name !== 'gamma')
  .map(e => ({
    name: e.name,
    type: e.type,
    pos: lib.fmt(e.position),
    dist: e.position.distanceTo(bot.entity.position).toFixed(1)
  }))
  .sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));

console.log(`Found ${entities.length} entities:`);
for (const e of entities.slice(0, 20)) {
  console.log(`- ${e.name} (${e.type}) at ${e.pos}, dist: ${e.dist}`);
}

// Also check players
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  }
}

// Check time
console.log('Time:', JSON.stringify(lib.time()));
