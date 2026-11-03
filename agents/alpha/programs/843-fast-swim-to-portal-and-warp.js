// programs/843-fast-swim-to-portal-and-warp.js
console.log('=== Program 843: Fast Swim to Portal & Warp to Overworld ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

bot.chat('alpha: Swimming directly to Nether Portal (46, 66, 2) to warp to Overworld base and unite with team!');

const target = new Vec3(46.0, 32.0, -6.0);
const start = Date.now();
const maxSwimMs = 55000;

console.log(`Swimming from ${lib.fmt(bot.entity.position)} to Portal Camp shoreline (46, 32, -6)...`);

while (Date.now() - start < maxSwimMs && !checkCancelled()) {
  const p = bot.entity.position;

  // Check if reached Portal Camp shoreline
  if (p.z >= -6.0 && p.x >= 40.0) {
    console.log(`Reached Portal Camp shoreline at ${lib.fmt(p)}!`);
    break;
  }

  // Continuously steer directly at target
  await bot.lookAt(new Vec3(target.x, Math.max(p.y, 31.8), target.z), true);

  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  if (p.y < 31.8) {
    bot.setControlState('jump', true);
  } else {
    bot.setControlState('jump', false);
  }

  await sleep(150);

  if ((Date.now() - start) % 5000 < 200) {
    console.log(`Swimming: pos ${lib.fmt(p)}, dist to portal: ${p.distanceTo(new Vec3(46, 66, 2)).toFixed(1)}m`);
  }
}

bot.clearControlStates();
console.log('Finished swim phase. Pos:', lib.fmt(bot.entity.position));

// 2. Ascend to Portal at (46, 66, 2)
if (bot.game.dimension === 'the_nether') {
  console.log('Ascending and locating Nether Portal...');

  // Search for nether_portal block within 32m
  for (let attempt = 0; attempt < 5 && bot.game.dimension === 'the_nether' && !checkCancelled(); attempt++) {
    const portalBlock = bot.findBlock({
      matching: b => b && b.name === 'nether_portal',
      maxDistance: 32
    });

    if (portalBlock) {
      console.log(`Found Nether Portal at: ${lib.fmt(portalBlock.position)}! Entering...`);
      try {
        await bot.pathfinder.goto(new goals.GoalBlock(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z));
      } catch (e) {
        await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
        bot.setControlState('forward', true);
        await sleep(2500);
        bot.clearControlStates();
      }
      break;
    } else {
      console.log('Moving closer to portal coordinates (46, 66, 2)...');
      try {
        await bot.pathfinder.goto(new goals.GoalNear(46.0, 66.0, 2.0, 3.0));
      } catch (e) {
        await bot.lookAt(new Vec3(46.0, 66.0, 2.0), true);
        bot.setControlState('forward', true);
        bot.setControlState('jump', true);
        await sleep(2000);
        bot.clearControlStates();
      }
    }
  }

  // Wait for portal warp into Overworld
  console.log('Waiting for Overworld warp...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !checkCancelled()) {
    const curPb = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 6 });
    if (curPb) {
      await bot.lookAt(curPb.position.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
    }
    await sleep(300);
  }
  bot.clearControlStates();
}

// 3. In Overworld Base
if (bot.game.dimension === 'overworld') {
  bot.chat('alpha: REUNITED IN OVERWORLD! Moving into Base House (293, 72, -55) to join Beta, Delta & Gamma for Stronghold march!');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -55.0, 1.2));
  } catch (e) {}

  // Equip full iron armor & weapon
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  console.log('Alpha safely in Overworld at Base!');
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
