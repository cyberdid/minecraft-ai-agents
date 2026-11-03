// programs/834-swim-to-portal-and-warp.js
console.log('=== Program 834: Swim to Portal Camp & Warp to Overworld ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

bot.chat('alpha: Swimming remaining 73m South to Nether Portal (46, 66, 2) to join Beta for Stronghold triangulation!');

const target = new Vec3(46.0, 32.0, -6.0);
const start = Date.now();
const maxSwimMs = 60000;

console.log(`Swimming South from z = ${bot.entity.position.z.toFixed(1)} to z = -6.0...`);

while (Date.now() - start < maxSwimMs && !checkCancelled()) {
  const p = bot.entity.position;

  // Shoreline reached
  if (p.z >= -6.0) {
    console.log(`Reached Portal Camp shoreline at z=${p.z.toFixed(1)}! Pos: ${lib.fmt(p)}`);
    break;
  }

  // Face target
  await bot.lookAt(new Vec3(target.x, Math.max(p.y, 31.5), target.z), true);

  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  if (p.y < 31.8) {
    bot.setControlState('jump', true);
  } else {
    bot.setControlState('jump', false);
  }

  // Check obstacle ahead
  const ahead = bot.blockAt(p.offset(0, 0, 1));
  const head = bot.blockAt(p.offset(0, 1, 1));
  if (ahead && ahead.boundingBox === 'block' && ahead.name !== 'lava') {
    if (head && head.boundingBox === 'block' && (head.name === 'netherrack' || head.name.includes('soul'))) {
      try { await bot.dig(head, true); } catch (e) {}
    }
  }

  await sleep(150);

  if ((Date.now() - start) % 5000 < 200) {
    console.log(`Swimming: pos ${lib.fmt(p)}, dist to portal: ${p.distanceTo(new Vec3(46, 66, 2)).toFixed(1)}m`);
  }
}

bot.clearControlStates();
console.log('Finished swim phase. Pos:', lib.fmt(bot.entity.position));

// 2. Ascend to Portal at (46, 66, 2)
if (bot.entity.position.z >= -10.0) {
  console.log('Ascending to Nether Portal at (46, 66, 2)...');

  // Look for portal block
  const portalBlock = bot.findBlock({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 24
  });

  if (portalBlock) {
    console.log('Found Nether Portal at:', lib.fmt(portalBlock.position));
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z));
    } catch (e) {
      await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      await sleep(2500);
      bot.clearControlStates();
    }
  } else {
    // Navigate via safe coordinates
    try {
      await bot.pathfinder.goto(new goals.GoalNear(46.0, 66.0, 2.0, 1.5));
    } catch (e) {
      // Step towards x=46, z=2
      await bot.lookAt(new Vec3(46.5, 66.0, 2.0), true);
      bot.setControlState('forward', true);
      bot.setControlState('jump', true);
      await sleep(2000);
      bot.clearControlStates();
    }
  }

  // Wait for portal warp
  console.log('Entering portal and waiting for Overworld warp...');
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

// 3. Overworld Base House arrival
if (bot.game.dimension === 'overworld') {
  bot.chat('alpha: REUNITED IN OVERWORLD! Sprinting to Base House (293, 72, -55) to join Beta for Stronghold triangulation!');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -55.0, 1.2));
  } catch (e) {}

  // Equip full armor & weapon
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
