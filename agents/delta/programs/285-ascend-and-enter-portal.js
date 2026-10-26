// programs/285-ascend-and-enter-portal.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Check if we need to get to surface y=72
if (bot.entity.position.y < 70) {
  console.log('Ascending to surface y=72 near base (294, 72, -54)...');
  try {
    // Try goTo with dig enabled so pathfinder can ascend stairways/tunnels
    await lib.goTo(294, 72, -54, 2, { dig: true });
    console.log('Reached surface! Pos:', lib.fmt(bot.entity.position));
  } catch (err) {
    console.log('lib.goTo failed:', err.message, 'trying manual climb...');
    // If pathfinder struggles, dig up and tower if necessary
  }
}

console.log('Current pos:', lib.fmt(bot.entity.position));

// Now go to Nether Portal at (299.5, 73.0, -53.5)
console.log('Navigating to Nether Portal...');
try {
  await lib.goTo(299, 73, -54, 1, { dig: true });
} catch (e) {
  console.log('Go to portal near:', e.message);
}

// Step precisely into the portal block
console.log('Stepping into portal center (299.5, 73.0, -53.5)...');
await bot.lookAt(new Vec3(299.5, 74.0, -53.5));
bot.setControlState('forward', false);
bot.setControlState('back', false);
bot.setControlState('left', false);
bot.setControlState('right', false);

// Direct movement to center
const target = new Vec3(299.5, 73.0, -53.5);
const startPos = bot.entity.position.clone();
for (let i = 0; i < 30; i++) {
  const diff = target.minus(bot.entity.position);
  if (Math.abs(diff.x) < 0.2 && Math.abs(diff.z) < 0.2) {
    break;
  }
  await bot.lookAt(new Vec3(target.x, bot.entity.position.y + 1.6, target.z), true);
  bot.setControlState('forward', true);
  await sleep(100);
}
bot.setControlState('forward', false);

console.log('Standing at:', lib.fmt(bot.entity.position), 'waiting for portal teleport (up to 7s)...');
for (let i = 0; i < 14; i++) {
  await sleep(500);
  if (bot.game.dimension === 'the_nether') {
    console.log('SUCCESS! Arrived in the_nether at:', lib.fmt(bot.entity.position));
    break;
  }
}

console.log('Final dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
