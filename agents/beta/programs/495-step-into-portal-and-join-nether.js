// programs/495-step-into-portal-and-join-nether.js
console.log('=== Step: Step into Nether Portal & Transit ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Walk directly into portal center (298.5, 72.0, -54.0)
await bot.lookAt(new Vec3(298.5, 72.5, -54.0), true);
bot.setControlState('forward', true);
await sleep(1200);
bot.clearControlStates();

console.log('Standing in portal frame at:', lib.fmt(bot.entity.position));

// 2. Wait for dimension transit to the_nether (up to 12s)
for (let i = 0; i < 12; i++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
    console.log('SUCCESS: TRANSITED TO THE NETHER!');
    break;
  }
}

console.log('Current dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 3. If in Nether, step forward out of portal into bunker interior (40, 65, -6)
if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();
  console.log('Inside Nether bunker at', lib.fmt(bot.entity.position));
  
  // Announce arrival to team
  bot.chat(`beta: In the Nether at ${lib.fmt(bot.entity.position)}! Advancing along High Ridge trail to Fortress advance tunnel (44, 65, -133)!`);
} else {
  console.log('Still in Overworld, retrying portal entry...');
  try {
    await lib.goTo(298.5, 72.0, -54.0, 0.3);
  } catch (e) {}
}

console.log('Final pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
