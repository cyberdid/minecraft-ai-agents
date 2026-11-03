// programs/733-test-firing-slit.js
console.log('=== Program 733: Test Firing Slit at (36.5, 66.0, -188.0) ===');
console.log('Current pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// Equip shield and sword
const offhand = bot.inventory.slots[45];
if (offhand?.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

// Raise shield immediately
bot.activateItem(true);

// Move to (36.5, 66.0, -188.0)
console.log('Moving to true firing slit (36.5, 66.0, -188.0)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -188.0, 0.3));
} catch (e) {
  // Direct step
  await bot.lookAt(new Vec3(36.5, 66.0, -188.0), true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);
}

console.log('New pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Look toward Spawner at (32, 68, -190) with shield raised
await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);

// Check blazes visible and their distances
const blazes = Object.values(bot.entities)
  .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
  .map(e => ({
    id: e.id,
    pos: lib.fmt(e.position),
    dist: bot.entity.position.distanceTo(e.position).toFixed(2),
    hp: e.health
  }))
  .sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));

console.log(`Blazes visible: ${blazes.length}`);
for (const b of blazes) {
  console.log(` - Blaze #${b.id} at ${b.pos}, dist: ${b.dist}m, hp: ${b.hp}`);
}

return {
  pos: bot.entity.position,
  blazes: blazes.length,
  nearestDist: blazes[0]?.dist
};
