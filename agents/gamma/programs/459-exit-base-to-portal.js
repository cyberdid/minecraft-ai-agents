// programs/459-exit-base-to-portal.js
console.log('=== EXIT BASE TO PORTAL (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Check door at (294, 72, -54)
const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
console.log('Door block at (294, 72, -54):', doorBlock?.name);

// Open door and walk through to outside (294, 72, -53)
console.log('Opening door and walking through...');
try {
  await lib.door(294, 72, -54, true);
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 0.5));
  await lib.door(294, 72, -54, false);
} catch (e) {
  console.log('Door navigation note:', e.message);
}

console.log('Outside door! Pos:', lib.fmt(bot.entity.position));

// 2. Walk to portal sill at (299.5, 72.0, -52.5)
try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 72.0, -52.5, 0.8));
} catch (e) {
  console.log('Path to sill note:', e.message);
}

console.log('At portal sill! Pos:', lib.fmt(bot.entity.position));

// 3. Step forward and jump into active portal block (299.5, 73.0, -53.5)
const target = new Vec3(299.5, 73.0, -53.5);
await bot.lookAt(target, true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.setControlState('jump', false);
bot.setControlState('forward', false);
bot.clearControlStates();

console.log('Inside portal frame! Pos:', lib.fmt(bot.entity.position));

// 4. Stand motionless for warp
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 12000 && !isCancelled()) {
  await sleep(250);
}

console.log('Final dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health
};
