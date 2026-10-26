// programs/090-step-into-nether.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Walk right next to the portal frame (298, 72, -54)
const approachPos = new Vec3(298, 72, -54);
console.log('Navigating to portal approach at', lib.fmt(approachPos));
try {
  await bot.pathfinder.goto(new goals.GoalNear(approachPos.x, approachPos.y, approachPos.z, 1));
} catch (e) {
  console.log('Approach path note:', e.message);
  // fallback simple walk
  await lib.walkTo(approachPos.x, approachPos.z);
}

console.log('At portal approach:', lib.fmt(bot.entity.position));

// 2. Find nether_portal block
const portal = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 4, count: 1 })[0];
if (!portal) {
  console.log('No portal block found within 4 blocks!');
} else {
  console.log('Target portal block at:', lib.fmt(portal));
  // Look directly at portal block and step into it
  await bot.lookAt(new Vec3(portal.x + 0.5, portal.y + 0.5, portal.z + 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
  console.log('Stepped forward into portal block! Current pos:', lib.fmt(bot.entity.position));

  // Wait inside portal for teleport to occur
  console.log('Waiting for teleport (up to 15s)...');
  const startDim = bot.game.dimension;
  for (let s = 0; s < 15; s++) {
    await sleep(1000);
    if (bot.game.dimension !== startDim) {
      console.log(`Teleport detected! Dimension changed to: ${bot.game.dimension}`);
      break;
    }
  }
}

console.log('Pos final:', lib.fmt(bot.entity.position), 'Dimension final:', bot.game.dimension);

if (bot.game.dimension.includes('nether')) {
  bot.chat(`delta: Joined team in the Nether at ${lib.fmt(bot.entity.position)}!`);
}
