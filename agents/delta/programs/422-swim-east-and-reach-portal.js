// programs/422-swim-east-and-reach-portal.js
console.log('Delta start pos:', lib.fmt(bot.entity.position));

// 1. Swim east toward x=265, z=-54
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

const targetX = 265;
console.log(`Swimming toward x=${targetX}...`);
await bot.lookAt(new Vec3(targetX, 64, -54), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
bot.setControlState('sprint', true);

const swimStart = Date.now();
while (bot.entity.position.x < targetX && Date.now() - swimStart < 15000 && !isCancelled()) {
  await sleep(200);
}

bot.setControlState('forward', false);
bot.setControlState('jump', false);
bot.setControlState('sprint', false);

console.log('After swim pos:', lib.fmt(bot.entity.position), 'block:', bot.blockAt(bot.entity.position)?.name);

// 2. Now walk on land to the Nether Portal at (299, 72, -52)
console.log('Walking to portal approach (299, 72, -52)...');
try {
  await lib.goTo(299, 72, -52, 1.5, { timeoutMs: 30000 });
  console.log('Arrived at portal approach! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goTo portal failed, trying goToXZ:', e.message);
  try {
    await lib.goToXZ(299, -52, { timeoutMs: 20000 });
    console.log('Arrived at portal via XZ! Pos:', lib.fmt(bot.entity.position));
  } catch (e2) {
    console.log('goToXZ also failed:', e2.message);
  }
}

// 3. Enter Nether portal
if (bot.entity.position.distanceTo(new Vec3(299, 72, -54)) < 8) {
  console.log('Entering Nether Portal...');
  const res = await enterNetherPortal();
  console.log('enterNetherPortal result:', JSON.stringify(res));
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
