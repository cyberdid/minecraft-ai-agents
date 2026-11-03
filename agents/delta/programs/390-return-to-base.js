// programs/390-return-to-base.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// Sprint back to base shelter at (293, 72, -56)
console.log('Returning to base shelter at (293, 72, -56)...');
try {
  await lib.goTo(293, 72, -56, 1.5, { timeoutMs: 30000 });
} catch (e) {
  console.log('goTo base note:', e.message);
  // Direct movement fallback
  await bot.lookAt(new Vec3(293.5, 72.0, -56.5), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  await sleep(5000);
  bot.setControlState('forward', false);
  bot.setControlState('sprint', false);
  await lib.goTo(293, 72, -56, 1.5, { timeoutMs: 15000 });
}

console.log('Arrived at base! Pos:', lib.fmt(bot.entity.position));

// Check nearby ground items in/near base
const drops = await lib.pickup(10);
if (drops > 0) console.log(`Picked up ${drops} drops at base!`);

// Print inventory and gear
console.log('Delta inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

// Check nearby players (Alpha, Beta)
for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name]?.entity;
  if (p) console.log(`Teammate ${name} at ${lib.fmt(p.position)}`);
}
