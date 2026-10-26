// programs/371-goto-up-ramp.js
console.log('=== Test lib.goTo up the cleared ramp ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

try {
  console.log('Going to (308, 32, -41)...');
  await lib.goTo(308, 32, -41, 1, { timeoutMs: 10000 });
  console.log('Reached (308, 32, -41):', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Step 1 note:', e.message);
}

try {
  console.log('Going to (310, 34, -41)...');
  await lib.goTo(310, 34, -41, 1, { timeoutMs: 10000 });
  console.log('Reached (310, 34, -41):', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Step 2 note:', e.message);
}

try {
  console.log('Going to (312, 36, -41)...');
  await lib.goTo(312, 36, -41, 1, { timeoutMs: 10000 });
  console.log('Reached (312, 36, -41):', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Step 3 note:', e.message);
}

console.log('Final pos:', lib.fmt(bot.entity.position));
