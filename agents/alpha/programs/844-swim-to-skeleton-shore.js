// programs/844-swim-to-skeleton-shore.js
console.log('=== Program 844: Swim to Shore / Skeleton at (32, 36, -6) ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.chat('alpha: Swimming directly South along x=32 to Portal Camp shoreline (32, 36, -6)!');

const target = new Vec3(32.0, 36.0, -6.0);
await bot.lookAt(target, true);

bot.setControlState('forward', true);
bot.setControlState('jump', true);
bot.setControlState('sprint', true);

const swimStart = Date.now();
while (bot.entity.position.z < -8.0 && bot.health > 0 && bot.game.dimension === 'the_nether' && Date.now() - swimStart < 45000) {
  await bot.lookAt(new Vec3(32.0, Math.max(bot.entity.position.y, 34.0), -6.0), true);
  await sleep(150);

  if ((Date.now() - swimStart) % 5000 < 200) {
    console.log(`Swimming: pos=${lib.fmt(bot.entity.position)}, dist to shore: ${(-6.0 - bot.entity.position.z).toFixed(1)}m, HP=${bot.health}`);
  }
}
bot.clearControlStates();
console.log(`Reached destination: pos=${lib.fmt(bot.entity.position)}, dim=${bot.game.dimension}, HP=${bot.health}`);

// If arrived on shore and alive, search for skeleton or portal
if (bot.game.dimension === 'the_nether' && bot.health > 0) {
  // Find skeleton
  const skel = Object.values(bot.entities).find(e => e.name === 'skeleton' && bot.entity.position.distanceTo(e.position) <= 24);
  if (skel) {
    console.log(`Approaching skeleton at ${lib.fmt(skel.position)} to trigger reset...`);
    await bot.lookAt(skel.position, true);
    bot.setControlState('forward', true);
    await sleep(3000);
    bot.clearControlStates();
  }

  // Find portal
  const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 32 });
  if (portal) {
    console.log(`Entering Nether Portal at ${lib.fmt(portal.position)}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(portal.position.x, portal.position.y, portal.position.z));
    } catch (e) {
      await bot.lookAt(portal.position.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      await sleep(2000);
      bot.clearControlStates();
    }
  }
}

// Wait for Overworld arrival / respawn
console.log('Waiting for Overworld arrival...');
const owWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - owWait < 15000) {
  await sleep(250);
}

console.log(`Final state: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}`);
