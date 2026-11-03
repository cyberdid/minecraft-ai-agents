// programs/789-sprint-base-warp-and-unite-bunker.js
console.log('=== Program 789: Sprint to Portal, Warp & Unite at Bunker ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield and iron sword
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

const sword = bot.inventory.items().find(i => i.name === 'iron_sword');
if (sword) await bot.equip(sword, 'hand');

// 2. Sprint from world spawn to base portal at (299.5, 73.0, -54.0)
if (bot.game.dimension === 'overworld') {
  console.log('Sprinting East across overworld to Nether portal at (299.5, 73.0, -54.0)...');
  bot.chat('alpha: Sprinting to Nether portal (299.5, 73.0, -54.0) to warp into Nether and join team!');

  // Intermediate waypoints across terrain
  const overland = [
    new Vec3(200, 64, -70),
    new Vec3(240, 66, -65),
    new Vec3(280, 70, -60),
    new Vec3(299.5, 73.0, -54.0)
  ];

  for (const wp of overland) {
    if (checkCancelled()) break;
    if (bot.entity.position.distanceTo(wp) < 4.0) continue;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e) {
      try { await lib.goTo(wp.x, wp.y, wp.z, 3.0, { timeoutMs: 12000 }); } catch (e2) {}
    }
  }

  console.log('Arrived near portal frame:', lib.fmt(bot.entity.position));

  // 3. Enter Nether portal
  console.log('Warping into the Nether...');
  const warpRes = await enterNetherPortal(25000);
  console.log('Warp result:', JSON.stringify(warpRes));

  if (bot.game.dimension !== 'the_nether') {
    const pb = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
    if (pb) {
      await bot.pathfinder.goto(new goals.GoalBlock(pb.position.x, pb.position.y, pb.position.z));
      bot.pathfinder.stop();
      bot.clearControlStates();
      const wait = Date.now();
      while (bot.game.dimension !== 'the_nether' && Date.now() - wait < 15000 && !checkCancelled()) {
        await sleep(250);
      }
    }
  }
}

// 4. In the Nether: March with active shield to Fortress Workshop Bunker (44, 65, -127)
console.log(`Dimension now: ${bot.game.dimension}`);
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In the Nether! Active shield raised, marching safe waypoints to Fortress Workshop Bunker (44, 65, -127)!');

  globalThis.configureFireAvoidance();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // Active shield raised
  bot.activateItem(true);

  const bunkerWaypoints = [
    { x: 46, y: 65, z: -7 },
    { x: 54, y: 65, z: -7 },
    { x: 63, y: 64, z: -7 },
    { x: 63, y: 65, z: -20 },
    { x: 63, y: 66, z: -35 },
    { x: 62, y: 67, z: -50 },
    { x: 61.5, y: 67, z: -55 },
    { x: 61.5, y: 67, z: -60 },
    { x: 61.5, y: 67, z: -65 },
    { x: 61.5, y: 67, z: -70 },
    { x: 61.5, y: 67, z: -75 },
    { x: 62.0, y: 67, z: -80 },
    { x: 61, y: 66, z: -100 },
    { x: 50, y: 65, z: -115 },
    { x: 44, y: 65, z: -127 } // Fortress Bunker entrance
  ];

  let startIdx = 0;
  for (let i = 0; i < bunkerWaypoints.length; i++) {
    const wp = bunkerWaypoints[i];
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 3.5) {
      startIdx = i + 1;
    }
  }

  for (let i = startIdx; i < bunkerWaypoints.length && !checkCancelled(); i++) {
    const wp = bunkerWaypoints[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 2.0) continue;

    await globalThis.clearFireAhead();

    // Look low to avoid enderman aggro
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

    // Maintain raised shield
    bot.activateItem(true);

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try {
        await globalThis.clearFireAhead();
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.2));
      } catch (e2) {}
    }

    await globalThis.clearFireAhead();
    try { await lib.pickup(3.0); } catch (e) {}

    // Defense if hostile mob in melee range
    const nearestHostile = lib.hostiles(3.5)[0];
    if (nearestHostile && nearestHostile.entity) {
      bot.deactivateItem();
      bot.attack(nearestHostile.entity);
      await sleep(600);
      bot.activateItem(true);
    }

    if (bot.health <= 7) {
      console.log(`HP low (${bot.health}) at WP ${i + 1}, taking cover.`);
      break;
    }
  }

  bot.deactivateItem();
  console.log('Nether march complete. Final position:', lib.fmt(bot.entity.position));

  if (bot.entity.position.distanceTo(new Vec3(44, 65, -127)) < 8.0) {
    bot.chat('alpha: REUNITED AT FORTRESS BUNKER (44, 65, -127)! Ready to pool gold and harvest Ender Pearls for Milestone 9!');
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
