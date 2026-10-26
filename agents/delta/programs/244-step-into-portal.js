// programs/244-step-into-portal.js
console.log('Delta pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.pathfinder.stop();
await sleep(100);

if (bot.game.dimension !== 'the_nether') {
  console.log('Stepping East into portal at (299.5, 73.0, -54.0)...');
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  
  // Jump up onto obsidian and step into portal
  bot.setControlState('jump', true);
  bot.setControlState('forward', true);
  await sleep(700);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
  
  console.log('Position inside portal:', lib.fmt(bot.entity.position));
  console.log('Standing still inside portal to trigger teleportation...');
  
  // Wait up to 10 seconds for dimension transition
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    if (bot.game.dimension === 'the_nether') break;
  }
}

console.log('Result dim:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension === 'the_nether') {
  bot.chat(`delta: Successfully entered the Nether at ${lib.fmt(bot.entity.position)}!`);
}
