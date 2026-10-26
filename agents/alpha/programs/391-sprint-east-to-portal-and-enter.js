// programs/391-sprint-east-to-portal-and-enter.js
console.log('=== Program 391: Sprint East to Portal & Enter Nether ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Sprint East (+x) towards base portal at (299.5, 73.0, -54.0)
console.log('Sprinting East along z=-54 towards portal...');
try {
  await lib.goTo(260, 68, -54, 3, { timeoutMs: 15000 });
} catch (e) {
  console.log('Stage 1 travel note:', e.message);
  try { await lib.goToXZ(260, -54, { timeoutMs: 15000 }); } catch (e2) {}
}

console.log('Alpha at:', lib.fmt(bot.entity.position));

try {
  await lib.goTo(299.5, 73.0, -54.0, 0, { timeoutMs: 20000 });
} catch (e) {
  console.log('Stage 2 portal approach note:', e.message);
  // Direct forward jump into portal
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0));
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1500);
  bot.setControlState('jump', false);
  await sleep(1000);
  bot.setControlState('forward', false);
}

console.log('Alpha position:', lib.fmt(bot.entity.position));

// 2. Wait for dimension change to the_nether
console.log('Standing inside portal for dimension change...');
for (let wait = 0; wait < 25; wait++) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** ARRIVED IN THE NETHER! ***');
    break;
  }
  await sleep(500);
}

console.log('Current dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat('team: Alpha has arrived at Nether Base Camp (40, 65, -7)! United with Beta and Delta. Advancing to Fortress!');

  for (const name of ['beta', 'delta', 'gamma']) {
    const p = bot.players[name];
    if (p && p.entity) {
      console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
    }
  }
}

console.log('Alpha status:', JSON.stringify(lib.status()));
