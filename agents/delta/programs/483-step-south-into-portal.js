// programs/483-step-south-into-portal.js
console.log('Delta pos before stepping into portal:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// Face z=-54.0 (south)
const portalCenter = new Vec3(299.5, 73.0, -54.0);
await bot.lookAt(portalCenter, true);

// Walk south until z <= -53.8 and z >= -54.2
bot.setControlState('forward', true);
const walkStart = Date.now();
while (bot.entity.position.z > -53.9 && Date.now() - walkStart < 2000) {
  await sleep(40);
}
bot.setControlState('forward', false);
bot.clearControlStates();

console.log('Now at portal center position:', lib.fmt(bot.entity.position));

// Hold position until warped
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 15000) {
  await sleep(350);
}

console.log('Warp result: dim=', bot.game.dimension, 'pos=', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat('delta: Teleported into the_nether! Safe inside bunker (40, 65, -7). Advancing to mine gold for Milestone 9!');
  await sleep(500);
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
