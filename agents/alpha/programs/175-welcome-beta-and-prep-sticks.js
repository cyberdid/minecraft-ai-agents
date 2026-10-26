// programs/175-welcome-beta-and-prep-sticks.js
console.log('--- Preparing Sticks for Beta & Awaiting Arrival ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight);

// 1. Step out, chop 1 log, craft sticks
console.log('Stepping out to get 1 log for sticks...');
try {
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d && !d.getProperties().open) await bot.activateBlock(d);
  await lib.walkTo(294.5, -52.0, 3000);
  if (d && d.getProperties().open) await bot.activateBlock(d);
  
  await lib.collect('*_log', 1);
  
  // Return to base
  await lib.goTo(294, 72, -53, 1);
  const d2 = bot.blockAt(new Vec3(294, 72, -54));
  if (d2 && !d2.getProperties().open) await bot.activateBlock(d2);
  await lib.walkTo(293.5, -56.0, 3000);
  if (d2 && d2.getProperties().open) await bot.activateBlock(d2);
  
  const log = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
  if (log) {
    await lib.craft(log.replace('_log', '_planks'), 4);
    await lib.craft('stick', 8);
    // Put 4 sticks in chest for Beta
    await lib.deposit({ stick: 4 }, 293, 72, -57);
    console.log('Deposited 4 sticks in chest for Beta!');
  }
} catch (e) {
  console.log('Stick prep note:', e.message);
}

// 2. Wait for Beta to arrive
console.log('Waiting for Beta to reach base...');
for (let wait = 0; wait < 30; wait++) {
  if (isCancelled()) break;
  await sleep(1000);
  const beta = bot.players.beta?.entity;
  if (beta && beta.position.distanceTo(bot.entity.position) < 8) {
    console.log(`Beta arrived at base! Pos: ${lib.fmt(beta.position)}, held: ${beta.heldItem?.name}`);
    bot.chat('beta: Welcome back! Sticks are in chest. Craft diamond_pickaxe for Milestone 6!');
    break;
  }
}

console.log('Night in:', lib.time().secondsUntilNight, 's');
console.log('Inventory:', JSON.stringify(lib.inv()));
