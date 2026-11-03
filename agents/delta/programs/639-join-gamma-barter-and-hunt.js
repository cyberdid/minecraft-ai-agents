console.log('=== DELTA: JOIN GAMMA BARTER & HUNT ===');
console.log(`Delta pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Walk along covered tunnel to Gamma at (48, 65, -142)
console.log('Moving along covered corridor towards (44..48, 65, -142)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(46.0, 65.0, -140.0, 1.5));
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -138.0, 1.5));
  } catch (e2) {}
}

console.log('Current pos:', lib.fmt(bot.entity.position));

// Vacuum all dropped items along the corridor
try {
  const count = await lib.pickup(6.0);
  console.log(`Picked up ${count} items from floor!`);
} catch (e) {}

// Check nearby entities
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
for (const p of players) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, dist=${p.position.distanceTo(bot.entity.position).toFixed(1)}m, held=${p.heldItem?.name || 'none'}`);
}

const droppedItems = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 12);
console.log(`Dropped items nearby: ${droppedItems.length}`);
for (const it of droppedItems) {
  console.log(`  Item at ${lib.fmt(it.position)}`);
}

// Check Piglins nearby
const piglins = Object.values(bot.entities).filter(e => (e.name === 'piglin' || e.name === 'piglin_brute') && e.position.distanceTo(bot.entity.position) < 16);
console.log(`Piglins within 16m: ${piglins.length}`);
for (const pig of piglins) {
  console.log(`  ${pig.name} at ${lib.fmt(pig.position)} (dist ${pig.position.distanceTo(bot.entity.position).toFixed(1)}m)`);
}

// Check Endermen nearby
const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && e.position.distanceTo(bot.entity.position) < 16);
console.log(`Endermen within 16m: ${endermen.length}`);
for (const ender of endermen) {
  console.log(`  Enderman at ${lib.fmt(ender.position)} (dist ${ender.position.distanceTo(bot.entity.position).toFixed(1)}m)`);
}

console.log(`Inventory ender_pearl: ${lib.count('ender_pearl')}`);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
