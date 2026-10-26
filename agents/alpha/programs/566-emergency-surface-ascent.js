// programs/566-emergency-surface-ascent.js
console.log('=== Program 566: Emergency Surface Ascent ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'oxygen:', bot.oxygenLevel);

const cur = bot.blockAt(bot.entity.position);
console.log('Block at feet:', cur?.name);

// Check if in water, jump/swim up immediately!
if (cur && (cur.name === 'water' || cur.name === 'flowing_water')) {
  console.log('IN WATER! Swimming UP!');
  bot.setControlState('jump', true);
}

// Find path or stairs to y=72
// Base is at (294, 72, -54)
console.log('Ascending towards base at (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -54, 2, { timeoutMs: 15000, dig: true });
} catch (e) {
  console.log('lib.goTo note:', e.message);
  // Manual upwards motion: face +x towards 295, jump and move forward
  await bot.lookAt(new Vec3(294, 72, -54), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(3000);
  bot.setControlState('forward', false);
  bot.setControlState('jump', false);
}

console.log('Pos after ascent:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'oxygen:', bot.oxygenLevel);
bot.setControlState('jump', false);
