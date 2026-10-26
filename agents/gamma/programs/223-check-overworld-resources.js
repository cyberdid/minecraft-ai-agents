// programs/223-check-overworld-resources.js
console.log('=== OVERWORLD BASE SURROUNDINGS SCAN ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Animals within 30m
const animals = Object.values(bot.entities).filter(e => 
  ['pig', 'cow', 'sheep', 'chicken'].includes(e.name) && 
  e.position.distanceTo(bot.entity.position) < 40
);
console.log(`Animals nearby (${animals.length}):`);
for (const a of animals) {
  console.log(` - ${a.name} at ${lib.fmt(a.position)} (dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m)`);
}

// 2. Iron ore within 25m
const ironOres = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 25,
  count: 5
});
console.log(`Iron ore nearby (${ironOres.length}):`, ironOres.map(p => lib.fmt(p)));

// 3. Coal ore within 25m
const coalOres = bot.findBlocks({
  matching: b => b && (b.name === 'coal_ore' || b.name === 'deepslate_coal_ore'),
  maxDistance: 25,
  count: 5
});
console.log(`Coal ore nearby (${coalOres.length}):`, coalOres.map(p => lib.fmt(p)));

// 4. Players
console.log('\n--- PLAYERS ---');
for (const p of Object.values(bot.players)) {
  const ent = p.entity;
  console.log(`${p.username}: ${ent ? `${lib.fmt(ent.position)} dist=${bot.entity.position.distanceTo(ent.position).toFixed(1)}m` : 'far/offline'}`);
}
