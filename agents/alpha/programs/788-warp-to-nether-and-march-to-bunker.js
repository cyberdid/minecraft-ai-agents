// programs/788-warp-to-nether-and-march-to-bunker.js
console.log('=== Program 788: Ascend Shaft, Warp into Nether & March to Bunker ===');
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

// 2. Ascend mine shaft to surface (302, 71, -44)
console.log('Ascending mine shaft to surface...');
const ascentWps = [
  new Vec3(302, 53, -54),
  new Vec3(302, 60, -50),
  new Vec3(302, 66, -46),
  new Vec3(302, 71, -44)
];

for (const wp of ascentWps) {
  if (checkCancelled()) break;
  if (bot.entity.position.distanceTo(wp) < 2.0) continue;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 8000 }); } catch (e2) {}
  }
}

console.log('Surface reached:', lib.fmt(bot.entity.position));

// 3. Step to Nether Portal and warp into the Nether!
bot.chat('alpha: Nether portal is lit! Stepping into portal at (299.5, 73.0, -54.0) to warp into the Nether!');
console.log('Calling enterNetherPortal()...');
const warpResult = await enterNetherPortal(30000);
console.log('Warp result:', JSON.stringify(warpResult));

if (bot.game.dimension !== 'the_nether') {
  // If not in nether yet, step directly into portal coordinates and hold motionless for 4.5s
  console.log('Attempting direct step into portal block...');
  const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
  if (portalBlock) {
    await bot.pathfinder.goto(new goals.GoalBlock(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z));
    bot.pathfinder.stop();
    bot.clearControlStates();
    const waitWarp = Date.now();
    while (bot.game.dimension !== 'the_nether' && Date.now() - waitWarp < 20000 && !checkCancelled()) {
      await sleep(250);
    }
  }
}

console.log(`Dimension after warp attempt: ${bot.game.dimension}, position: ${lib.fmt(bot.entity.position)}`);

// 4. If in the Nether, march safe waypoints to Fortress Workshop Bunker (44, 65, -127)
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: Arrived in the_nether! Marching safe covered waypoints to Fortress Workshop Bunker (44, 65, -127)!');
  
  // Enable fire avoidance
  globalThis.configureFireAvoidance();
  
  // Re-equip weapons/armor
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // Waypoints from Nether Portal Camp (40, 65, -7) to Bunker (44, 65, -127)
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
    { x: 44, y: 65, z: -127 } // Fortress Workshop Bunker!
  ];

  for (let i = 0; i < bunkerWaypoints.length && !checkCancelled(); i++) {
    const wp = bunkerWaypoints[i];
    const target = new Vec3(wp.x, wp.y, wp.z);
    if (bot.entity.position.distanceTo(target) < 2.0) continue;

    await globalThis.clearFireAhead();

    // Look low to avoid enderman gaze aggro
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

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

    if (bot.health <= 8) {
      console.log(`HP reduced to ${bot.health}, holding in cover at WP ${i + 1}`);
      break;
    }
  }

  console.log('Final position in Nether:', lib.fmt(bot.entity.position));
  if (bot.entity.position.distanceTo(new Vec3(44, 65, -127)) < 8.0) {
    bot.chat('alpha: Reunited with team at Fortress Workshop Bunker (44, 65, -127)! Ready for Milestone 9!');
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
