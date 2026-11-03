console.log('=== PROGRAM 707: ENTER PORTAL VIA Z=-6 CORRIDOR ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.chat('delta: Navigating via z=-6 directly into Portal 2 at (41, 65, -7)!');

// Shift to z=-6.0
console.log('Aligning to z=-6.0...');
await bot.lookAt(new Vec3(bot.entity.position.x, 65.0, -6.0), true);
bot.setControlState('forward', true);
const alignStart = Date.now();
while (bot.entity.position.z < -6.2 && Date.now() - alignStart < 1500) {
  await sleep(50);
}
bot.setControlState('forward', false);

console.log('Aligned! Pos:', lib.fmt(bot.entity.position));

// Equip pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Walk West along z=-6 down to x=41.5
console.log('Marching West along z=-6 to x=41.5...');
for (let x = Math.floor(bot.entity.position.x); x >= 41 && !isCancelled(); x--) {
  // Clear any obstacle at x, y=65..66, z=-6
  for (const dy of [0, 1]) {
    const b = bot.blockAt(new Vec3(x, 65 + dy, -6));
    if (b && b.boundingBox === 'block' && b.name !== 'nether_portal' && !globalThis.isProtectedBlock(b)) {
      console.log(`Digging block at (${x}, ${65 + dy}, -6): ${b.name}`);
      try { await bot.dig(b, true); } catch (e) {}
    }
  }

  // Ensure floor underfoot at y=64
  const fl = bot.blockAt(new Vec3(x, 64, -6));
  if (!fl || fl.boundingBox !== 'block') {
    const cobble = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'soul_sand' || i.name === 'netherrack');
    if (cobble) {
      try {
        await bot.equip(cobble, 'hand');
        const ref = bot.blockAt(new Vec3(x + 1, 64, -6));
        if (ref) await bot.placeBlock(ref, new Vec3(-1, 0, 0));
      } catch (e) {}
    }
  }

  // Step forward
  await bot.lookAt(new Vec3(x, 65.0, -6.0), true);
  bot.setControlState('forward', true);
  const stepStart = Date.now();
  while (bot.entity.position.x > x + 0.3 && Date.now() - stepStart < 1200) {
    if (bot.entity.isCollidedHorizontally) {
      bot.setControlState('jump', true);
      await sleep(200);
      bot.setControlState('jump', false);
    }
    await sleep(50);
  }
  bot.setControlState('forward', false);
}

console.log('Reached x=41.5, z=-6! Pos:', lib.fmt(bot.entity.position));

// Step North into portal block at (41, 65, -7)
console.log('Stepping North into Portal at (41, 65, -7)...');
const portalPos = new Vec3(41.0, 65.5, -7.0);
await bot.lookAt(portalPos, true);
bot.setControlState('forward', true);
await sleep(1500);
bot.setControlState('forward', false);

console.log('Inside Portal! Waiting for warp to Overworld...');
const warpStart = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// In Overworld: enter Base House at (293, 72, -55)
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

  console.log('Secure inside Base House! Final pos:', lib.fmt(bot.entity.position));
  bot.chat(`delta: Secure in Overworld Base House! HP: ${bot.health}/20, Food: ${bot.food}/20. Team ready for Stronghold expedition!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
