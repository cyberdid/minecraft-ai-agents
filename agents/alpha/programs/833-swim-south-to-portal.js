// programs/833-swim-south-to-portal.js
console.log('=== Program 833: Swim South across Lava to Nether Portal ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

bot.chat('alpha: Swimming South across lava lake to Nether Portal Camp (46, 66, 2) to join team in Overworld!');

// 1. Swim up to surface of lava (y=31.5)
console.log('Ascending to lava surface...');
bot.setControlState('jump', true);
const ascendStart = Date.now();
while (bot.entity.position.y < 31.0 && Date.now() - ascendStart < 8000 && !checkCancelled()) {
  await sleep(150);
}

// 2. Swim south towards (46, 32, -6)
const target = new Vec3(46.0, 32.0, -6.0);
const start = Date.now();
const maxSwimMs = 50000;

console.log(`Starting South swim from z = ${bot.entity.position.z.toFixed(1)} to z = -6.0...`);

while (Date.now() - start < maxSwimMs && !checkCancelled()) {
  const p = bot.entity.position;

  // Check if reached Portal Camp shoreline
  if (p.z >= -8.0) {
    console.log(`Reached Portal Camp shoreline at z=${p.z.toFixed(1)}! Pos: ${lib.fmt(p)}`);
    break;
  }

  // Face target
  await bot.lookAt(new Vec3(target.x, Math.max(p.y, 31.5), target.z), true);

  // Keep skimming surface
  bot.setControlState('forward', true);
  if (p.y < 31.8) {
    bot.setControlState('jump', true);
  } else {
    bot.setControlState('jump', false);
  }

  // Check if obstacle ahead
  const ahead = bot.blockAt(p.offset(0, 0, 1));
  const head = bot.blockAt(p.offset(0, 1, 1));
  if (ahead && ahead.boundingBox === 'block' && ahead.name !== 'lava') {
    if (head && head.boundingBox === 'block' && (head.name === 'netherrack' || head.name.includes('soul'))) {
      try { await bot.dig(head, true); } catch (e) {}
    }
  }

  await sleep(150);

  if ((Date.now() - start) % 5000 < 200) {
    console.log(`Swimming South: currently at ${lib.fmt(p)}, dist to portal: ${p.distanceTo(new Vec3(46, 66, 2)).toFixed(1)}m`);
  }
}

bot.clearControlStates();
console.log('Finished swim phase. Pos:', lib.fmt(bot.entity.position));

// 3. Ascend to Portal at (46, 66, 2)
if (bot.entity.position.z >= -15.0) {
  console.log('Navigating to Nether Portal at (46, 66, 2)...');
  
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
      await sleep(2000);
      bot.clearControlStates();
    }
  } else {
    // Navigate via safe staircase
    try {
      await bot.pathfinder.goto(new goals.GoalNear(46.0, 66.0, 2.0, 1.5));
    } catch (e) {}
  }

  // Wait for portal warp
  console.log('Waiting for Nether -> Overworld warp...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 20000 && !checkCancelled()) {
    await sleep(250);
  }
}

// 4. Overworld Base House arrival
if (bot.game.dimension === 'overworld') {
  bot.chat('alpha: Arrived in Overworld! Moving into Base House (293, 72, -55) to join Beta, Delta & Gamma!');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -55.0, 1.2));
  } catch (e) {}
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
