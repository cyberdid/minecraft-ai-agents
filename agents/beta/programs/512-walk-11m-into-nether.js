// programs/512-walk-11m-into-nether.js
console.log('=== Step: Walk 11m Directly into Nether Portal & Transit ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Walk directly to portal block at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Target portal block:', lib.fmt(portalTarget));

try {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.4);
  console.log('Reached portal via goTo:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goTo note, moving via controls:', e.message);
  await bot.lookAt(portalTarget.offset(0, 0.5, 0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  await sleep(600);
  bot.clearControlStates();
}

// Clear all controls to stand completely still inside portal block
bot.clearControlStates();
console.log('Standing still inside portal at:', lib.fmt(bot.entity.position));

// 2. Wait up to 12s for Nether transit (takes 80 ticks = 4s in survival)
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
    console.log(`SUCCESS: ENTERED THE NETHER at second ${s+1}! Pos:`, lib.fmt(bot.entity.position));
    break;
  }
}

// 3. Step forward out of portal into bunker interior (40, 65, -5)
if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();
  console.log('Inside Nether bunker at:', lib.fmt(bot.entity.position));
  bot.chat(`beta: In the Nether at ${lib.fmt(bot.entity.position)}! Advancing to join Gamma & Delta at Fortress hallway (44, 65, -135)!`);
}

console.log('Final dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
