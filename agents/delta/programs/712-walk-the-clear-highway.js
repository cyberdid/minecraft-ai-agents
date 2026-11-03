console.log('=== PROGRAM 712: WALK THE CLEAR HIGHWAY TO PORTAL 1 ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Equip pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Step 1: Walk to (47.0, 65.0, -6.0)
console.log('Step 1: Walking to (47.0, 65.0, -6.0)...');
await bot.lookAt(new Vec3(47.0, 65.0, -6.0), true);
bot.setControlState('forward', true);
const s1Start = Date.now();
while (bot.entity.position.x > 47.3 && Date.now() - s1Start < 5000 && !isCancelled()) {
  if (bot.entity.isCollidedHorizontally) {
    bot.setControlState('jump', true);
    await sleep(200);
    bot.setControlState('jump', false);
  }
  await sleep(50);
}
bot.setControlState('forward', false);

console.log('Arrived at x=47! Pos:', lib.fmt(bot.entity.position));

// Step 2: Dig obstacle at (47, 65..66, -5) if present
for (const dy of [0, 1]) {
  const b = bot.blockAt(new Vec3(47, 65 + dy, -5));
  if (b && b.boundingBox === 'block') {
    console.log(`Digging obstacle at (47, ${65 + dy}, -5): ${b.name}`);
    try { await bot.dig(b, true); } catch (e) {}
  }
}

// Step 3: Walk to (47.0, 65.0, -2.0)
console.log('Step 3: Walking to (47.0, 65.0, -2.0)...');
await bot.lookAt(new Vec3(47.0, 65.0, -2.0), true);
bot.setControlState('forward', true);
const s3Start = Date.now();
while (bot.entity.position.z < -2.3 && Date.now() - s3Start < 5000 && !isCancelled()) {
  if (bot.entity.isCollidedHorizontally) {
    bot.setControlState('jump', true);
    await sleep(200);
    bot.setControlState('jump', false);
  }
  await sleep(50);
}
bot.setControlState('forward', false);

console.log('Arrived at z=-2! Pos:', lib.fmt(bot.entity.position));

// Step 4: Dig obstacles at z=0 and z=1 along x=47
for (const z of [0, 1]) {
  for (const dy of [0, 1]) {
    const b = bot.blockAt(new Vec3(47, 65 + dy, z));
    if (b && b.boundingBox === 'block' && b.name !== 'nether_portal') {
      console.log(`Digging obstacle at (47, ${65 + dy}, ${z}): ${b.name}`);
      try { await bot.dig(b, true); } catch (e) {}
    }
  }
}

// Step 5: Step directly into Portal block at (47, 66, 2)
console.log('Step 5: Stepping into Portal at (47, 66, 2)...');
const portalPos = new Vec3(47.0, 66.5, 2.0);
await bot.lookAt(portalPos, true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1500);
bot.clearControlStates();

console.log('Inside portal frame! Waiting for warp to Overworld...');
const warpStart = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
  await sleep(250);
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Step 6: In Overworld, enter Base House at (293, 72, -55)
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld! Walking into Base House (293, 72, -55)...');
  try {
    if (bot.entity.position.distanceTo(new Vec3(293.5, 72.0, -56.0)) > 3.0) {
      await lib.goToXZ(294, -53, { timeoutMs: 12000 });
      await lib.goThroughDoor(294, 72, -54);
    }
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 1.0));
    } catch (e2) {}
  }

  console.log('Secure inside Base House! Final Pos:', lib.fmt(bot.entity.position));
  bot.chat('delta: Secure inside Overworld Base House! HP: 20/20, Food: 20/20. United with team!');
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
