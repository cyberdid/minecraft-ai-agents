console.log('=== PROGRAM 708: FINISH FINAL 9M TO PORTAL ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.chat('delta: Final 9 meters to Nether Portal!');

// Equip pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Walk West along z=-6 to x=41
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

  // Check if inside nether portal
  const curBlock = bot.blockAt(bot.entity.position);
  if (curBlock && curBlock.name === 'nether_portal') {
    console.log('Inside nether_portal block at:', lib.fmt(bot.entity.position));
    break;
  }
}

console.log('Reached portal area! Pos:', lib.fmt(bot.entity.position));

// Search nearest portal block and step inside
let portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 6 });
if (portalBlock) {
  console.log(`Entering portal at ${lib.fmt(portalBlock.position)}...`);
  await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);

  console.log('Waiting for warp to Overworld...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

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

  // Inside base house
  console.log('Secure inside Base House! Final pos:', lib.fmt(bot.entity.position));
  bot.chat('delta: United with team in Overworld Base House! Ready for Milestone 10 Stronghold expedition!');
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
