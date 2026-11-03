// programs/689-inspect-pillbox-and-farm.js
console.log('=== Program 689: Inspect Pillbox and Farm Blazes ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);

// Inspect terrain between bot and Pillbox (36, 66, -187)
console.log('Blocks along path to pillbox:');
for (let z = -181; z >= -188; z--) {
  const floor = bot.blockAt(new Vec3(36, 65, z));
  const floor37 = bot.blockAt(new Vec3(37, 65, z));
  const eye = bot.blockAt(new Vec3(36, 66, z));
  console.log(`z=${z}: (36,65): ${floor?.name}, (37,65): ${floor37?.name}, (36,66): ${eye?.name}`);
}

// Check nearby entities (Blazes, Piglins, teammates)
const entities = Object.values(bot.entities).filter(e => e.isValid && bot.entity.position.distanceTo(e.position) <= 24);
console.log(`Found ${entities.length} nearby entities within 24m:`);
for (const e of entities) {
  if (e.id === bot.entity.id) continue;
  console.log(`- ${e.name || e.username} at ${lib.fmt(e.position)}, dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)}m`);
}
