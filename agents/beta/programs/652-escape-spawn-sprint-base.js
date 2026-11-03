// programs/652-escape-spawn-sprint-base.js
console.log('=== Program 652: Escape Drowned & Sprint to Base ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// First: escape water immediately by jumping/swimming forward towards dry land (+x, +z)
bot.setControlState('jump', true);
bot.setControlState('sprint', true);
bot.setControlState('forward', true);
await bot.lookAt(new Vec3(bot.entity.position.x + 20, 64, bot.entity.position.z + 10), true);
await sleep(3000);
bot.clearControlStates();

console.log('After initial swim-out pos:', lib.fmt(bot.entity.position));

// Setup pathfinder for long sprint to base
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowSprinting = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

bot.chat('beta: Escaping world spawn river! Sprinting 260m back to Base!');

// Intermediate checkpoints towards base (294, 72, -54)
const checkpoints = [
  new Vec3(100, 65, -140),
  new Vec3(150, 65, -110),
  new Vec3(200, 65, -80),
  new Vec3(250, 68, -60),
  new Vec3(290, 72, -54)
];

for (let i = 0; i < checkpoints.length && !isCancelled(); i++) {
  const cp = checkpoints[i];
  console.log(`[CP ${i+1}/${checkpoints.length}] Sprinting towards ${cp}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNearXZ(cp.x, cp.z, 5));
    console.log(`Reached CP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`CP ${i+1} path error:`, e.message);
    try {
      await lib.goToXZ(cp.x, cp.z);
    } catch (e2) {}
  }
}

// Reach base door
console.log('Arrived near base! Current pos:', lib.fmt(bot.entity.position));
try {
  await lib.goTo(294, 72, -53, 1.5, { dig: false });
} catch (e) {}

// Enter base door
console.log('Entering base shelter through door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(293, 72, -55, 1, { dig: false });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside base shelter! Pos:', lib.fmt(bot.entity.position));

// Lock spawn point at Bed
console.log('Setting spawn at base bed...');
try {
  await lib.setSpawn();
  console.log('SPAWN POINT LOCKED AT BED!');
  bot.chat('beta: Safely back inside base! Spawn point locked at bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
  // Manual bed right click if setSpawn errored
  const beds = bot.findBlocks({ matching: b => b.name.includes('bed'), maxDistance: 5 });
  if (beds.length > 0) {
    const b = bot.blockAt(beds[0]);
    await bot.activateBlock(b);
    console.log('Activated bed directly at', beds[0]);
  }
}

return {
  pos: bot.entity.position,
  health: bot.health,
  food: bot.food,
  dimension: bot.game.dimension
};
