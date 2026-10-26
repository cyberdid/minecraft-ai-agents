// programs/348-walk-to-main-shaft.js
console.log('=== Walk from (303, 22, -46) to main shaft at (304, y, -34) ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Walk towards (304, 22, -34)
console.log('Walking to (304, 22, -34)...');
try {
  await lib.goTo(304, 22, -34, 2, { timeoutMs: 20000 });
  console.log('Reached (304, 22, -34):', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Walk note:', e.message);
}

// 2. Ascend to (304, 38, -34)
console.log('Ascending to (304, 38, -34)...');
try {
  await lib.goTo(304, 38, -34, 2, { timeoutMs: 20000 });
  console.log('Reached y=38:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Ascent y=38 note:', e.message);
}

// 3. Ascend to (304, 54, -34)
console.log('Ascending to (304, 54, -34)...');
try {
  await lib.goTo(304, 54, -34, 2, { timeoutMs: 20000 });
  console.log('Reached y=54:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Ascent y=54 note:', e.message);
}

// 4. Ascend to surface (303, 61, -37) -> (302, 71, -42)
console.log('Ascending to surface...');
try {
  await lib.goTo(303, 61, -37, 2, { timeoutMs: 20000 });
  await lib.goTo(302, 71, -42, 2, { timeoutMs: 20000 });
  console.log('At surface shaft top!', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Surface ascent note:', e.message);
}

// 5. Enter base
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
  bot.chat('beta: Reached base! Ready for Milestone 3 iron gear expedition!');
} catch (e) {
  console.log('Base note:', e.message);
}

console.log('Beta pos:', lib.fmt(bot.entity.position));
