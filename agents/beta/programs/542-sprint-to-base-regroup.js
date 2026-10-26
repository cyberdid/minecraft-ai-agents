// programs/542-sprint-to-base-regroup.js
console.log('=== Step: Sprint from Spawn to Base Camp & Regroup with Alpha ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

const waypoints = [
  new Vec3(140, 64, -90),
  new Vec3(180, 65, -75),
  new Vec3(230, 68, -65),
  new Vec3(285, 72, -55)
];

bot.chat('beta: Sprinting back to Base Camp to regroup with Alpha and Delta...');

for (const wp of waypoints) {
  if (isCancelled()) break;
  console.log(`Running to ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
    console.log(`Reached ${lib.fmt(wp)}: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Path note at ${lib.fmt(wp)}, sprinting direct:`, err.message);
    await bot.lookAt(new Vec3(wp.x, bot.entity.position.y, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(3500);
    bot.clearControlStates();
  }
}

console.log('Arrived near Base Camp at:', lib.fmt(bot.entity.position));

// Enter base through door at (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
const doorBlock = bot.blockAt(doorPos) || bot.findBlock({ matching: b => b.name.includes('door'), maxDistance: 6 });
if (doorBlock) {
  console.log('Entering base shelter...');
  try {
    await lib.goThroughDoor(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z);
    console.log('Inside base at:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('goThroughDoor error:', e.message);
    try { await lib.goTo(292, 72, -56, 1); } catch (e2) {}
  }
} else {
  try { await lib.goTo(292, 72, -56, 1); } catch (e) {}
}

// Lock bed spawn point
try {
  await lib.setSpawn();
  console.log('SUCCESS: Bed spawn point locked!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// Inspect base chests and furnaces
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 6, count: 5 });
for (const cp of chests) {
  try {
    const c = await bot.openChest(bot.blockAt(cp));
    const items = c.items();
    console.log(`Chest at ${lib.fmt(cp)}:`, items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    for (const it of items) {
      if (['stone_pickaxe', 'iron_pickaxe', 'stone_sword', 'iron_sword', 'cobblestone', 'cooked_beef', 'cooked_mutton', 'bread'].includes(it.name)) {
        try { await c.withdraw(it.type, null, it.count); } catch (e) {}
      }
    }
    await c.close();
  } catch (e) {}
}

// Check nearby teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

bot.chat('beta: Arrived in Base Camp! Spawn set. Alpha, let us pool gear and enter Nether!');
console.log('Final Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'HP:', bot.health);

return {
  pos: bot.entity.position,
  hp: bot.health,
  timeOfDay: bot.time.timeOfDay
};
