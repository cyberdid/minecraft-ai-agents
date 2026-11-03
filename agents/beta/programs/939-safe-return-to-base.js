console.log('=== Program 939: Safe Return to Overworld Base ===');
globalThis.isProgramCancelled = isCancelled;

bot.chat('Beta: Milestone 9 COMPLETE! Returning to Overworld base with 22 Ender Pearls to craft Eyes of Ender!');

// 1. Maintain golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// 2. Configure pathfinder to avoid fire and dangerous drops
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = false;
moves.maxDropDown = 2;
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

// 3. Return Waypoints from (43, 67, -116) to Portal at (46, 66, 2) / (40, 65, -7)
const returnWaypoints = [
  { x: 50, y: 65, z: -115 },
  { x: 61, y: 66, z: -100 },
  { x: 62, y: 67, z: -80 },
  { x: 61.5, y: 67, z: -70 },
  { x: 61.5, y: 67, z: -55 },
  { x: 63, y: 66, z: -35 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 64, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 46, y: 65, z: -7 }
];

console.log(`Starting march across ${returnWaypoints.length} waypoints towards Nether Portal...`);

for (let i = 0; i < returnWaypoints.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  await globalThis.clearFireAhead();

  const wp = returnWaypoints[i];
  const target = new Vec3(wp.x, wp.y, wp.z);

  // Keep gaze low (y=64) to never trigger Enderman aggro
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  console.log(`Advancing to WP ${i + 1}/${returnWaypoints.length} at (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await globalThis.clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {
      console.log(`WP ${i + 1} pathfinder fallback error:`, e2.message);
    }
  }

  try { await lib.pickup(3.0); } catch (e) {}
}

// 4. Enter Nether Portal
if (bot.game.dimension === 'the_nether' && !isCancelled()) {
  console.log('Searching for active nether_portal block near portal camp...');
  let portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 24 });
  if (!portal) {
    // Try moving closer to (46, 66, 2)
    try {
      await bot.pathfinder.goto(new goals.GoalNear(46, 66, 0, 3));
      portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
    } catch (e) {}
  }

  if (portal) {
    console.log(`Portal block found at ${lib.fmt(portal.position)}! Entering portal...`);
    await bot.lookAt(portal.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(2000);
    bot.setControlState('forward', false);

    console.log('Waiting for dimension change to overworld...');
    const startWarp = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - startWarp < 25000 && !isCancelled()) {
      await sleep(300);
    }
  } else {
    console.log('No nether_portal block found within 24m!');
  }
}

// 5. Post-transit into Overworld Base
if (bot.game.dimension === 'overworld') {
  bot.chat('Beta: Safely arrived in Overworld! Heading to Base House at (293, 72, -55)...');
  console.log('Warped into overworld! Current pos:', lib.fmt(bot.entity.position));
  try {
    await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 12000 });
  } catch (e) {
    console.log('Pathfind to base house error:', e.message);
  }
}

console.log('Final Status: Dim =', bot.game.dimension, 'Pos =', lib.fmt(bot.entity.position), 'Pearls =', lib.count('ender_pearl'));
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  pearls: lib.count('ender_pearl'),
  hp: bot.health,
  food: bot.food
};
