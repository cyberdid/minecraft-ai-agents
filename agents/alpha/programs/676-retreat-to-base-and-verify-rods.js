// programs/676-retreat-to-base-and-verify-rods.js
console.log('=== Program 676: Retreat to Base & Verify Milestone 8 ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Equip shield in offhand
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}
bot.activateItem(true); // Raise shield for defense

// 2. Configure pathfinder
const moves = new Movements(bot, mcData);
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

// Helper to punch out fire
const clearFireAhead = async function () {
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

// 3. Reverse waypoints to retreat
const RETREAT_WAYPOINTS = [
  { x: 38, y: 65, z: -176 },
  { x: 44, y: 65, z: -169 },
  { x: 44, y: 65, z: -160 },
  { x: 44, y: 65, z: -145 },
  { x: 44, y: 65, z: -127 },
  { x: 50, y: 65, z: -115 },
  { x: 61, y: 66, z: -100 },
  { x: 62.0, y: 67, z: -80 },
  { x: 61.5, y: 67, z: -75 },
  { x: 61.5, y: 67, z: -70 },
  { x: 61.5, y: 67, z: -65 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -55 },
  { x: 62, y: 67, z: -50 },
  { x: 63, y: 66, z: -35 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 64, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 46, y: 65, z: -7 },
  { x: 41.5, y: 65, z: 2.5 } // Return portal bunker
];

console.log('Retreating along waypoints...');
for (let i = 0; i < RETREAT_WAYPOINTS.length && !checkCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  await clearFireAhead();
  const wp = RETREAT_WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.5) continue;

  if (wp.z <= -165) {
    bot.setControlState('sneak', true);
    bot.activateItem(true);
  } else {
    bot.setControlState('sneak', false);
  }

  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    try {
      await clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {}
  }
}

bot.setControlState('sneak', false);
bot.deactivateItem();
console.log('Reached portal area! Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 4. Enter Nether portal back to Overworld
if (bot.game.dimension === 'the_nether') {
  const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
  if (portalBlock) {
    console.log('Found Nether portal at', portalBlock.position, '- stepping in...');
    await bot.pathfinder.goto(new goals.GoalNear(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z, 0.8));
    await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.setControlState('forward', false);

    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !checkCancelled()) {
      await sleep(300);
    }
  }
}

// 5. In Overworld: walk into base house and inspect chest
if (bot.game.dimension === 'overworld') {
  console.log('Back in Overworld! Walking to base house (293, 72, -55)...');
  try {
    await lib.goTo(294, 72, -52, 2, { timeoutMs: 15000 });
  } catch (e) {}

  if (bot.entity.position.z > -54.0) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  // Inspect Base Chest
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57)) || bot.findBlock({ matching: b => b && b.name === 'chest', maxDistance: 8 });
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const items = chest.containerItems().map(i => `${i.name}x${i.count}`).join(', ');
      console.log('Base Chest contains:', items);
      bot.chat(`alpha: Base Chest verified: ${items}`);
      await chest.close();
    } catch (e) {
      console.log('Error opening chest:', e.message);
    }
  }
}

console.log('=== Program 676 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Inv:', lib.inv());
