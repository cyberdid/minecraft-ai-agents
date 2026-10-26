// programs/176-regroup-and-enter-nether.js
console.log('--- REGROUP AT BASE & TRANSIT TO NETHER ---');
console.log('Current pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Walk back to base at (294, 72, -53)
console.log('Returning to base at (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 20000 });
} catch (e) {
  try { await lib.goToXZ(294, -53, { timeoutMs: 15000 }); } catch (e2) {}
}

console.log('At base door:', lib.fmt(bot.entity.position));
bot.chat('team: gamma regrouped at base with stone tools, cobble & wood! Entering Nether portal now.');

// 2. Step into Nether portal at (299, 73, -54)
console.log('Moving into Nether portal block at (299, 73, -54)...');
try {
  await lib.goTo(299, 73, -54, 0, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo portal note:', e.message);
  try { await lib.walkTo(299, -54, 4000); } catch (e2) {}
}

bot.clearControlStates();
console.log('Inside portal frame! Standing still for 4s transit...');

// 3. Wait for transit to Nether
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (!String(bot.game.dimension).includes('nether')) {
  // Retry walkTo center
  console.log('Retrying walk into portal center (299.5, -54.0)...');
  await lib.walkTo(299.5, -54.0, 3000);
  bot.clearControlStates();
  const t1 = Date.now();
  while (!String(bot.game.dimension).includes('nether') && (Date.now() - t1 < 20000) && !isCancelled()) {
    await sleep(1000);
  }
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within deadline');
}

console.log('SUCCESS! Arrived in Nether at:', lib.fmt(bot.entity.position));
console.log('Dimension:', bot.game.dimension);

// 4. Step out of Nether portal to (40.5, 65, -5) to clear portal cooldown
console.log('Stepping out of portal to bunker floor at (40.5, 65, -5)...');
await lib.walkTo(40.5, -5.0, 3000);
bot.clearControlStates();
console.log('Pos in Nether bunker:', lib.fmt(bot.entity.position));

bot.chat(`gamma arrived in Nether bunker ${lib.fmt(bot.entity.position)}! Gearing golden boots and pushing to Fortress Workshop.`);

console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
