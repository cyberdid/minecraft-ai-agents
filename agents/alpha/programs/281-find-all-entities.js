// programs/281-find-all-entities.js
console.log('=== Program 281: Find All Entities ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position));

const entities = Object.values(bot.entities);
console.log(`Total entities: ${entities.length}`);

for (const e of entities) {
  if (e.id === bot.entity.id) continue;
  const dist = bot.entity.position.distanceTo(e.position);
  console.log(`Entity: name=${e.name}, type=${e.type}, pos=${lib.fmt(e.position)}, dist=${dist.toFixed(1)}m`);
}
