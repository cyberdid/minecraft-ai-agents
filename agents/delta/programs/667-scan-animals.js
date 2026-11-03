console.log('=== DELTA: SCAN ANIMALS & FOOD SOURCES ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}`);

const animals = Object.values(bot.entities).filter(e =>
  (e.name === 'cow' || e.name === 'pig' || e.name === 'sheep' || e.name === 'chicken') &&
  e.isValid &&
  bot.entity.position.distanceTo(e.position) <= 64
);

console.log(`Nearby animals (${animals.length}):`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)} (dist ${bot.entity.position.distanceTo(a.position).toFixed(1)}m)`);
}

// Check coal in inventory or base chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  const chest = await bot.openContainer(chestBlock);
  const coal = chest.containerItems().find(i => i.name === 'coal' || i.name === 'charcoal');
  console.log(`Fuel in chest: ${coal ? `${coal.name} x${coal.count}` : 'none'}`);
  chest.close();
}

return {
  animals: animals.map(a => ({ name: a.name, pos: a.position })),
  food: bot.food
};
