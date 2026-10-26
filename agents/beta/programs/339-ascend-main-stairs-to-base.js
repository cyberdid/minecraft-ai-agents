// programs/339-ascend-main-stairs-to-base.js
console.log('=== Ascend main stairs from (302, 17, -41) to base ===');
console.log('Beta start pos:', lib.fmt(bot.entity.position));

bot.chat('beta: Ascending main shaft stairs from y=17 to base!');

const m = new Movements(bot, mcData);
m.canDig = false;
m.allowParkour = false;
m.allowSprinting = true;
bot.pathfinder.setMovements(m);

// 1. Ascend to y=35
console.log('Ascending to (302, 35, -42)...');
try {
  await lib.goTo(302, 35, -42, 2, { timeoutMs: 25000 });
  console.log('At y=35:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 1 note:', e.message);
}

// 2. Ascend to y=55
console.log('Ascending to (302, 55, -43)...');
try {
  await lib.goTo(302, 55, -43, 2, { timeoutMs: 25000 });
  console.log('At y=55:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 2 note:', e.message);
}

// 3. Ascend to shaft top (302, 71, -44)
console.log('Ascending to shaft top (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 25000 });
  console.log('At surface shaft top!', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 3 note:', e.message);
}

// 4. Enter base door (294, 72, -54)
console.log('Entering base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base with team!');
  bot.chat('beta: Safely inside base with team! Milestone 7 complete, ready for full iron armor prep!');
} catch (e) {
  console.log('Base entry note:', e.message);
}

console.log('Final position:', lib.fmt(bot.entity.position));
