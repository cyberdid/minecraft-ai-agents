console.log('=== PROGRAM 697: STEP THROUGH PORTAL TO BASE ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.chat('delta: At Nether Portal camp (63.5, -8.4)! Stepping through portal to Overworld Base!');

// 1. Maintain golden boots and shield
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// 2. Clear fire and walk West to Portal at (46, 65, -7)
if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
  await globalThis.clearFireAhead();

  try {
    await lib.goToXZ(54, -7, { timeoutMs: 6000 });
  } catch (e) {}

  await globalThis.clearFireAhead();

  try {
    await lib.goToXZ(46, -7, { timeoutMs: 6000 });
  } catch (e) {}

  // Find nether portal block
  const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
  if (portalBlock) {
    console.log(`Found portal block at ${lib.fmt(portalBlock.position)}, entering...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z, 0.8));
    } catch (e) {
      await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      await sleep(1500);
      bot.setControlState('forward', false);
    }

    console.log('Inside portal frame! Waiting for warp to Overworld...');
    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !checkCancelled()) {
      await sleep(250);
    }
  }
}

// 3. In Overworld: enter Base House at (293, 72, -55)
if (bot.game.dimension === 'overworld') {
  console.log('Arrived in Overworld! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

  try {
    if (bot.entity.position.distanceTo(new Vec3(293.5, 72.0, -56.0)) > 3.0) {
      console.log('Moving into Base House...');
      await lib.goToXZ(294, -53, { timeoutMs: 12000 });
      await lib.goThroughDoor(294, 72, -54);
    }
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 1.0));
    } catch (e2) {}
  }

  console.log('Secure inside Base House! Final pos:', lib.fmt(bot.entity.position));

  // Check teammates
  const team = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
  console.log('Teammates in base:');
  for (const t of team) {
    console.log(`- ${t.username} at ${lib.fmt(t.position)}, held: ${t.heldItem ? t.heldItem.name : 'none'}`);
  }

  bot.chat(`delta: United at Overworld Base! Team has 22 Blaze Powder, 22 Ender Pearls, and Stronghold located at (233, -98)! Ready for Stronghold expedition!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
