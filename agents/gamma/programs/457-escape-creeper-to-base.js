// programs/457-escape-creeper-to-base.js
console.log('=== ESCAPE CREEPER & SPRINT TO BASE (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.maxDropDown = 3;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

try { await lib.equipWeapon(); } catch (e) {}

// If creeper is very close (< 5m), strike it or sprint away
const creeper = Object.values(bot.entities).find(e => e.name === 'creeper' && bot.entity.position.distanceTo(e.position) <= 8);
if (creeper) {
  console.log(`Creeper detected at ${lib.fmt(creeper.position)}! Distance: ${bot.entity.position.distanceTo(creeper.position).toFixed(1)}m`);
  bot.chat('gamma: Creeper nearby! Sprinting directly to Base house (294, 72, -54)!');
}

// Sprint directly towards base door at (294, 72, -53)
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
} catch (e) {
  console.log('Direct goto note:', e.message);
  await bot.lookAt(new Vec3(294, 72, -53), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  if (bot.entity.isCollidedHorizontally) bot.setControlState('jump', true);
  await sleep(3000);
  bot.clearControlStates();
}

console.log('At base door! Pos:', lib.fmt(bot.entity.position));

// Enter base door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -55));
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside base shelter! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat('gamma: Safely inside Base shelter!');

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
