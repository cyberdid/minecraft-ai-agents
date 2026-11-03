// programs/521-inspect-surroundings.js
console.log('=== DELTA: INSPECT SURROUNDINGS ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, Dimension: ${bot.game.dimension}`);
console.log(`HP: ${bot.health}, Food: ${bot.food}`);

// Players
console.log('--- PLAYERS ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}`);
  } else {
    console.log(`Player ${name}: not nearby / no entity`);
  }
}

// Entities nearby
console.log('--- NEARBY ENTITIES ---');
const entities = Object.values(bot.entities)
  .filter(e => e !== bot.entity && bot.entity.position.distanceTo(e.position) <= 24)
  .map(e => `${e.name || e.type} at ${lib.fmt(e.position)} (dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)})`);
console.log(entities.slice(0, 15).join('\n') || 'None');

// Items on ground nearby
console.log('--- ITEMS ON GROUND ---');
const items = Object.values(bot.entities)
  .filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 16)
  .map(e => `Item: id=${e.id} at ${lib.fmt(e.position)} dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}`);
console.log(items.join('\n') || 'None');

// Containers / Crafting table nearby
console.log('--- CONTAINERS / WORKSTATIONS ---');
const containers = bot.findBlocks({
  matching: b => b && ['chest', 'trapped_chest', 'crafting_table', 'furnace'].includes(b.name),
  maxDistance: 16,
  count: 10
});
for (const cp of containers) {
  const b = bot.blockAt(cp);
  console.log(`Found ${b.name} at ${lib.fmt(cp)} (dist: ${bot.entity.position.distanceTo(cp).toFixed(1)})`);
}

console.log('--- INVENTORY ---');
console.log(JSON.stringify(lib.inv()));

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  inventory: lib.inv()
};
