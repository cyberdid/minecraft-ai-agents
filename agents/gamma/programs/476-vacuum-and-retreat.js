// programs/476-vacuum-and-retreat.js
console.log('=== GAMMA: RETREAT TO OVERWORLD BASE & CONSOLIDATE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Vacuum any nearby items at Pillbox
try {
  const items = Object.values(bot.entities).filter(e =>
    e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 4.0
  );
  for (const item of items) {
    await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.5));
  }
} catch (e) {}

const rodsHeld = lib.count('blaze_rod');
console.log(`Blaze Rods held: ${rodsHeld}. Initiating retreat to Overworld base...`);
bot.chat(`gamma: Milestone 8 complete (Beta holds 8 rods)! Gamma retreating from Pillbox to Overworld base...`);

// 2. Configure pathfinder
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = false;
netherMoves.maxDropDown = 2;
netherMoves.allowParkour = false;
bot.pathfinder.setMovements(netherMoves);

// 3. Retreat waypoints
const RETREAT_WAYPOINTS = [
  { x: 38, y: 65, z: -176 },
  { x: 44, y: 65, z: -169 },
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -145 },
  { x: 44, y: 65, z: -127 }, // Fortress Workshop
  { x: 50, y: 65, z: -115 },
  { x: 61, y: 66, z: -100 },
  { x: 61.5, y: 66, z: -90 },
  { x: 62.0, y: 67, z: -80 },
  { x: 61.5, y: 67, z: -75 },
  { x: 61.5, y: 67, z: -70 },
  { x: 61.5, y: 67, z: -65 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -55 },
  { x: 62, y: 67, z: -50 },
  { x: 62.5, y: 66, z: -42 },
  { x: 63, y: 66, z: -35 },
  { x: 63, y: 65, z: -28 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 65, z: -15 },
  { x: 63, y: 64, z: -7 },
  { x: 58, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 50, y: 65, z: -7 },
  { x: 46, y: 65, z: -7 },
  { x: 40, y: 65, z: -7 } // Nether Portal Bunker
];

for (let i = 0; i < RETREAT_WAYPOINTS.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  const wp = RETREAT_WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 1.8) continue;

  console.log(`[Retreat WP ${i + 1}/${RETREAT_WAYPOINTS.length}] -> (${wp.x}, ${wp.y}, ${wp.z}) dist: ${bot.entity.position.distanceTo(target).toFixed(1)}m`);

  // Enderman protection: look at feet
  await bot.lookAt(new Vec3(wp.x, bot.entity.position.y - 0.4, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNearXZ(wp.x, wp.z, 2.0));
    } catch (e2) {}
  }

  try { await lib.pickup(3.0); } catch (e) {}
}

console.log('Arrived at Nether portal bunker area! Pos:', lib.fmt(bot.entity.position));

// 4. Enter Nether portal to return to Overworld
if (bot.game.dimension === 'the_nether') {
  const portalBlock = bot.findBlock({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 12
  });
  if (portalBlock) {
    console.log('Stepping into return portal block at:', lib.fmt(portalBlock.position));
    try {
      await bot.pathfinder.goto(new goals.GoalNear(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z, 0.5));
    } catch (e) {
      await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      await sleep(1500);
      bot.setControlState('forward', false);
    }

    const warpStart = Date.now();
    while (bot.game.dimension === 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
      await sleep(300);
    }
  }
}

// 5. In Overworld: enter base house
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Back in Overworld! Heading to base house (293, 72, -55)...');
  console.log('In Overworld! Walking to base house...');

  // Base door at (294, 72, -54)
  try {
    await lib.goTo(294, 72, -52.5, 1.0, { timeoutMs: 10000 });
    await lib.door(294, 72, -54, true);
    await lib.goTo(294, 72, -55, 1.0, { timeoutMs: 5000 });
    await lib.door(294, 72, -54, false);
  } catch (e) {
    try { await lib.goTo(293, 72, -55, 2.0, { timeoutMs: 10000 }); } catch (e2) {}
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  rods: lib.count('blaze_rod'),
  inv: lib.inv()
};
