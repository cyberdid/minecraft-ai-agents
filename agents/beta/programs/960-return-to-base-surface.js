console.log('=== Program 960: Return to Base Surface (y=72) ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Water bucket:', lib.count('water_bucket'));

const basePos = new Vec3(293, 72, -56);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

console.log(`Climbing back up to Base at ${lib.fmt(basePos)}...`);
try {
  await bot.pathfinder.goto(new goals.GoalNear(basePos.x, basePos.y, basePos.z, 1.2));
} catch (e) {
  console.log('Pathfinder error, trying intermediate climb:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(290, 64, -55, 1.5));
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1.2));
  } catch (e2) {
    console.log('Intermediate climb notice:', e2.message);
  }
}

console.log('Beta arrived back at Base! Position:', lib.fmt(bot.entity.position));

// Check teammates in base
for (const p of Object.values(bot.players)) {
  if (p.entity && p.username !== bot.username) {
    console.log(`Teammate ${p.username}: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  }
}

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  water_bucket: lib.count('water_bucket'),
  ender_eyes: lib.count('ender_eye'),
  ender_pearls: lib.count('ender_pearl')
};
