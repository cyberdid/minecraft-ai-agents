// programs/506-enter-nether-perfect.js
console.log('=== GAMMA: PRECISE OVERWORLD PORTAL ENTRY ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

if (bot.game.dimension === 'the_nether') {
  console.log('Already in the_nether!');
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

// 1. Move to staging point directly in front of the portal at (299.5, 72.0, -52.5)
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 72.0, -52.5, 0.4));
} catch (e) {
  try { await lib.goToXZ(299.5, -52.5, { timeoutMs: 5000 }); } catch (e2) {}
}

console.log('At staging point:', lib.fmt(bot.entity.position));

// 2. Look directly into portal center at (299.5, 73.2, -53.8)
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

const portalCenter = new Vec3(299.5, 73.2, -53.8);
await bot.lookAt(portalCenter, true);

// 3. Step forward and jump gently onto y=73 inside the portal
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(350);
bot.setControlState('jump', false);
await sleep(150);
bot.setControlState('forward', false);
bot.clearControlStates();

console.log('Stepped into portal frame. Pos:', lib.fmt(bot.entity.position));

// 4. Stand COMPLETELY MOTIONLESS for portal warp
const startWarp = Date.now();
bot.chat('gamma: Standing inside Overworld portal, warping to Nether...');

while (bot.game.dimension !== 'the_nether' && Date.now() - startWarp < 25000 && !isCancelled()) {
  const p = bot.entity.position;
  // If we drifted outside the portal (z > -53.0 or z < -54.8 or y < 72.5), nudge back in
  if (p.y < 72.8 || p.z > -53.2 || p.z < -54.6 || Math.abs(p.x - 299.5) > 0.8) {
    console.log(`Nudging back into portal from ${lib.fmt(p)}...`);
    await bot.lookAt(portalCenter, true);
    bot.setControlState('forward', true);
    if (p.y < 72.8) bot.setControlState('jump', true);
    await sleep(250);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
    bot.clearControlStates();
  }
  await sleep(250);
}

bot.clearControlStates();

if (bot.game.dimension === 'the_nether') {
  console.log('*** CLEAN TRANSIT SUCCESSFUL! WELCOME TO THE NETHER! ***');
  console.log('Nether Pos:', lib.fmt(bot.entity.position));
  bot.chat(`gamma: WARPED TO NETHER! Pos: ${lib.fmt(bot.entity.position)}. Wearing golden_boots!`);

  // Step out of Nether portal into bunker floor
  await sleep(500);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
  bot.clearControlStates();
} else {
  console.log('Transit timed out or failed. Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  wearingBoots: lib.count('golden_boots') > 0 || (bot.inventory.slots[8] && bot.inventory.slots[8].name === 'golden_boots')
};
