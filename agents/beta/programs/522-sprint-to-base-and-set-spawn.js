// programs/522-sprint-to-base-and-set-spawn.js
console.log('=== Step: Sprint from Spawn to Base Camp & Set Spawn ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Stop any residual pathfinder state
bot.pathfinder.stop();
await sleep(200);

const waypoints = [
  new Vec3(120, 64, -75),
  new Vec3(180, 65, -68),
  new Vec3(240, 68, -60),
  new Vec3(290, 72, -54)
];

bot.chat('beta: Sprinting from spawn to Base Camp...');

for (const wp of waypoints) {
  if (isCancelled()) break;
  console.log(`Running to waypoint ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
    console.log(`Reached ${lib.fmt(wp)}! Pos now: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Path note at ${lib.fmt(wp)}: ${err.message}, attempting sprint push...`);
    await bot.lookAt(new Vec3(wp.x, bot.entity.position.y, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(3500);
    bot.clearControlStates();
  }
}

console.log('Arrived near Base Camp at:', lib.fmt(bot.entity.position));

// Enter base shelter through door at (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
const doorBlock = bot.blockAt(doorPos) || bot.blockAt(new Vec3(294, 73, -54));
if (doorBlock && doorBlock.name.includes('door')) {
  console.log(`Entering base through door at ${lib.fmt(doorBlock.position)}...`);
  try {
    await lib.goThroughDoor(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z);
  } catch (e) {
    console.log('goThroughDoor error:', e.message);
    try { await lib.goTo(293, 72, -56, 1); } catch (e2) {}
  }
} else {
  console.log('Walking directly into base at (293, 72, -56)...');
  try {
    await lib.goTo(293, 72, -56, 1);
  } catch (e) {
    console.log('goTo base error:', e.message);
  }
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// Lock spawn point at base bed
try {
  await lib.setSpawn();
  console.log('SUCCESS: Bed spawn point locked!');
  bot.chat('beta: Arrived at Base Camp! Bed spawn set.');
} catch (err) {
  console.log('lib.setSpawn notice:', err.message);
}

// Check chests inside base
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 6, count: 5 });
console.log(`Found ${chests.length} chests in base`);
for (const cp of chests) {
  try {
    const cBlock = bot.blockAt(cp);
    const chest = await bot.openChest(cBlock);
    const items = chest.items().map(it => `${it.name}x${it.count}`);
    console.log(`Chest at ${lib.fmt(cp)}:`, items.join(', ') || 'empty');
    await chest.close();
  } catch (e) {
    console.log(`Error inspecting chest at ${lib.fmt(cp)}:`, e.message);
  }
}

// Report final status
console.log('Beta Pos:', lib.fmt(bot.entity.position), 'Inventory:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  dimension: bot.game.dimension,
  hp: bot.health
};
