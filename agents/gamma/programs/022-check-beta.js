// programs/022-check-beta.js
bot.chat('gamma heading down shaft to escort Beta with obsidian!');

console.log('gamma at:', lib.fmt(bot.entity.position));

// Let's see if we can pathfind into the shaft opening
// In program 21: air at (302, 70, -42), air at (304, 67, -44)
console.log('Stepping to shaft opening at (302, 70, -42)...');
try {
  await lib.goTo(302, 70, -42, 1, { dig: true });
} catch (e) {
  console.log('Step 1 error:', e.message);
}

console.log('Now at:', lib.fmt(bot.entity.position));

// Check Beta position
const beta = bot.players.beta?.entity;
if (beta) {
  console.log(`Beta is at ${lib.fmt(beta.position)}, dist: ${beta.position.distanceTo(bot.entity.position).toFixed(1)}`);
  // Try to go near Beta
  try {
    await lib.goTo(beta.position.x, beta.position.y, beta.position.z, 2, { dig: true });
    console.log('Reached Beta! gamma at', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Pathfind to Beta error:', e.message);
  }
} else {
  console.log('Beta entity not in render distance right now.');
}

// Print current position and surroundings
console.log('Current gamma pos:', lib.fmt(bot.entity.position));
