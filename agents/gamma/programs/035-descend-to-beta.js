// programs/035-descend-to-beta.js
bot.chat('beta hold on! gamma coming down shaft with cooked_beef to escort you up!');

console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Move to shaft entrance at (302, 71, -44)
console.log('Moving to shaft entrance (302, 71, -44)...');
await lib.goTo(302, 71, -44, 1, { dig: true });

// 2. Stage 1: Descend to y=50 in shaft
console.log('Descend Stage 1: down towards y=50...');
try {
  await lib.goTo(302, 50, -44, 3, { dig: true });
  console.log('Reached Stage 1:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 1 error:', e.message);
}

// 3. Stage 2: Descend towards (298, 30, -25)
console.log('Descend Stage 2: towards (298, 30, -25)...');
try {
  await lib.goTo(298, 30, -25, 3, { dig: true });
  console.log('Reached Stage 2:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stage 2 error:', e.message);
}

// Check Beta position
const beta = bot.players.beta?.entity;
if (beta) {
  console.log(`Beta at ${lib.fmt(beta.position)}, dist: ${beta.position.distanceTo(bot.entity.position).toFixed(1)}`);
  try {
    await lib.goTo(beta.position.x, beta.position.y, beta.position.z, 2, { dig: true });
    console.log('Reached Beta! gamma at', lib.fmt(bot.entity.position));
    // Toss cooked beef to Beta
    if (lib.count('cooked_beef') > 0) {
      await bot.lookAt(beta.position.offset(0, 1.6, 0));
      await bot.toss(mcData.itemsByName.cooked_beef.id, null, 1);
      bot.chat('beta tossed you cooked_beef! Eat and let us climb to the portal!');
    }
  } catch (e) {
    console.log('GoTo Beta error:', e.message);
  }
} else {
  console.log('Beta not in render distance yet.');
}

console.log('Current gamma pos:', lib.fmt(bot.entity.position));
console.log('Night in:', lib.time().secondsUntilNight);
