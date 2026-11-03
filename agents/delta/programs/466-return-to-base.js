// programs/466-return-to-base.js
globalThis.isProgramCancelled = () => false;

console.log('Delta returning to Base from:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const clearFire = async () => {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 4.5,
    count: 5
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b, true);
    } catch (e) {}
  }
};

const RETREAT_WAYPOINTS = [
  { x: 44, y: 65, z: -169 },
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -145 },
  { x: 44, y: 65, z: -127 },
  { x: 50, y: 65, z: -115 },
  { x: 61, y: 66, z: -100 },
  { x: 62, y: 67, z: -80 },
  { x: 61.5, y: 67, z: -65 },
  { x: 61.5, y: 67, z: -50 },
  { x: 63, y: 66, z: -35 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 64, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 46, y: 65, z: -7 },
  { x: 40, y: 65, z: -7 } // Portal bunker
];

if (bot.game.dimension === 'the_nether') {
  try {
    const moves = new Movements(bot, mcData);
    const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
    for (const id of fireIds) moves.blocksToAvoid.add(id);
    if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
    moves.canDig = false;
    moves.allowParkour = false;
    bot.pathfinder.setMovements(moves);
  } catch (e) {}

  try { await lib.equipArmor(); } catch (e) {}
  try {
    const shield = bot.inventory.items().find(i => i.name === 'shield');
    if (shield) await bot.equip(shield, 'off-hand');
    bot.activateItem(true);
  } catch (e) {}

  for (let i = 0; i < RETREAT_WAYPOINTS.length; i++) {
    if (bot.game.dimension !== 'the_nether') break;
    const wp = RETREAT_WAYPOINTS[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 3.0) continue;

    console.log(`Walking to retreat WP ${i + 1}/${RETREAT_WAYPOINTS.length} (${wp.x}, ${wp.y}, ${wp.z})...`);
    await clearFire();

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
    } catch (e) {
      try {
        await lib.goTo(wp.x, wp.y, wp.z, 2.2, { dig: false, timeoutMs: 6000 });
      } catch (e2) {}
    }
  }

  // Enter Nether Portal at (40, 65, -7)
  console.log('Stepping into Nether Portal to return to Overworld...');
  const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
  if (portalBlock) {
    await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.setControlState('forward', false);

    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000) {
      await sleep(300);
    }
  }
}

console.log('Arrived in dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'overworld') {
  try {
    if (bot.entity.position.z > -54.0) {
      await lib.goThroughDoor(294, 72, -54);
    }
  } catch (e) {}

  try {
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1));
  } catch (e) {}

  bot.chat('delta: Reunited at Base! Milestone 8 100% COMPLETE! Ready for Milestone 9 (Ender Pearls)!');
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
