// programs/497-jump-into-portal.js
console.log('=== Step: Jump Forward into Portal Block (299.5, 73.0, -54.0) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position));

// Face (299.5, 73.5, -54.0)
await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);

// Jump forward into the portal frame
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.setControlState('jump', false);
await sleep(1500);
bot.clearControlStates();

console.log('Now standing inside portal at:', lib.fmt(bot.entity.position));

// Wait up to 14s for Nether dimension transit
for (let i = 0; i < 14; i++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
    console.log(`SUCCESS: IN THE NETHER at tick ${i}! Pos:`, lib.fmt(bot.entity.position));
    break;
  }
}

console.log('Final dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`beta: Dimension is ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}!`);
