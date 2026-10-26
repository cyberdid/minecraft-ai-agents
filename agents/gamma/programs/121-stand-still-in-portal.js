// programs/121-stand-still-in-portal.js
console.log('--- ENTER PORTAL & STAND STILL FOR 4S TRANSIT ---');
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Dim before:', bot.game.dimension);

// 1. Navigate directly into purple portal block at (299, 73, -54)
console.log('Navigating into portal block (299, 73, -54)...');
try {
  await lib.goTo(299, 73, -54, 0, { dig: true, timeoutMs: 25000 });
} catch (e) {
  console.log('lib.goTo note:', e.message);
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
}

console.log('Inside portal frame! Pos:', lib.fmt(bot.entity.position));

// 2. Stand completely still - clear all movement controls
bot.clearControlStates();
console.log('Standing completely still for 4s transit...');

const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting still in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 25s');
}

console.log('SUCCESS! Arrived in the Nether!');
console.log('Dimension:', bot.game.dimension);
console.log('Pos:', lib.fmt(bot.entity.position));

bot.chat(`gamma arrived in the Nether at ${lib.fmt(bot.entity.position)}! Dimension: ${bot.game.dimension}. Moving to Fortress Workshop.`);
