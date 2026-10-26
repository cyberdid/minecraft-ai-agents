// programs/543-reach-base-and-bed.js
console.log('=== Step: Final 100m Sprint to Base Camp & Set Spawn ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

const finalWps = [
  new Vec3(245, 67, -68),
  new Vec3(285, 72, -55)
];

for (const wp of finalWps) {
  if (isCancelled()) break;
  console.log(`Advancing to ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached ${lib.fmt(wp)}: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Path note at ${lib.fmt(wp)}, sprinting direct:`, err.message);
    await bot.lookAt(new Vec3(wp.x, bot.entity.position.y, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(2500);
    bot.clearControlStates();
  }
}

console.log('Near Base Camp at:', lib.fmt(bot.entity.position));

// Enter base through door at (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
const doorBlock = bot.blockAt(doorPos) || bot.findBlock({ matching: b => b.name.includes('door'), maxDistance: 6 });
if (doorBlock) {
  console.log('Entering base shelter via door...');
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

// Ensure door is closed
if (doorBlock) {
  const d = bot.blockAt(doorBlock.position);
  if (d && d._properties && d._properties.open) {
    try { await lib.door(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z, false); } catch (e) {}
  }
}

// Lock bed spawn point
try {
  await lib.setSpawn();
  console.log('SUCCESS: Bed spawn point locked!');
  bot.chat('beta: Arrived in Base Camp! Spawn locked.');
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
      if (['stone_pickaxe', 'iron_pickaxe', 'stone_sword', 'iron_sword', 'cobblestone', 'cooked_beef', 'bread'].includes(it.name)) {
        try { await c.withdraw(it.type, null, it.count); } catch (e) {}
      }
    }
    await c.close();
  } catch (e) {}
}

console.log('Time:', bot.time.timeOfDay, 'Seconds until night:', lib.time().secondsUntilNight);
console.log('Final Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

return {
  pos: bot.entity.position,
  timeOfDay: bot.time.timeOfDay,
  secondsUntilNight: lib.time().secondsUntilNight
};
