// programs/323-sprint-inside-base-now.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(100);

bot.chat('delta: Sprinting 33m into base shelter at (294, 72, -54)!');

// Direct sprint to door
const doorPos = new Vec3(293.5, 72.0, -54.0);
console.log('Sprinting straight to door at (293.5, 72.0, -54.0)...');

await bot.lookAt(new Vec3(doorPos.x, doorPos.y + 1, doorPos.z), true);
bot.setControlState('forward', true);
bot.setControlState('sprint', true);
bot.setControlState('jump', true);

for (let i = 0; i < 40; i++) {
  await sleep(150);
  const dist = bot.entity.position.distanceTo(doorPos);
  if (dist < 3.0) {
    console.log('Close to door! Dist:', dist.toFixed(1));
    break;
  }
  // Re-aim at door
  await bot.lookAt(new Vec3(doorPos.x, doorPos.y + 1, doorPos.z), true);
}
bot.clearControlStates();
console.log('At door pos:', lib.fmt(bot.entity.position));

// Enter base through door
console.log('Walking through door...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Successfully walked through door!');
} catch (e) {
  console.log('goThroughDoor note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// Lock spawn on bed
const beds = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 8, count: 5 });
console.log('Beds found in base:', beds.map(p => lib.fmt(p)));
if (beds.length > 0) {
  const targetBed = beds[beds.length - 1]; // Pick Bed 2
  console.log('Setting spawn on bed at', lib.fmt(targetBed));
  try {
    const bedBlock = bot.blockAt(targetBed);
    await bot.activateBlock(bedBlock);
    bot.chat(`delta: Safely inside base! Spawn locked at bed (${lib.fmt(targetBed)})!`);
  } catch (err) {
    console.log('Bed activate error:', err.message);
  }
}
