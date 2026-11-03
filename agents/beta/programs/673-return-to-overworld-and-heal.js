// programs/673-return-to-overworld-and-heal.js
console.log('=== Program 673: Return to Overworld to Heal & Gear Up ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Find nether portal block in bunker
const portal = bot.findBlock({
  matching: mcData.blocksByName.nether_portal ? mcData.blocksByName.nether_portal.id : () => false,
  maxDistance: 6
});

if (portal) {
  console.log('Found nether portal block at:', portal.position);
  await bot.lookAt(portal.position, true);
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.clearControlStates();
} else {
  console.log('Walking towards (40, 65, -7)...');
  await bot.lookAt(new Vec3(40, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.clearControlStates();
}

console.log('Inside portal. Waiting for warp to Overworld...');
const startDim = bot.game.dimension;
for (let s = 0; s < 18; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim || bot.game.dimension.includes('overworld')) {
    console.log(`WARPED TO OVERWORLD! Dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  health: bot.health,
  food: bot.food
};
