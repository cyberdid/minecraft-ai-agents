// programs/717-return-base-set-spawn-and-march.js
console.log('=== Program 717: Return to Base, Lock Spawn & March to Covered Tunnel ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Equip iron sword and shield
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

// 2. If at world spawn in Overworld, walk to Base at (293, 72, -55)
if (bot.game.dimension === 'overworld') {
  console.log('Navigating to Base house at (293, 72, -55)...');
  try {
    await lib.goToXZ(293, -55, { timeoutMs: 35000 });
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(293.0, 72.0, -55.0, 3.0));
    } catch (e2) {}
  }

  console.log('Arrived near Base:', lib.fmt(bot.entity.position));

  // Enter base door
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}

  // Lock spawn at Base Bed (294, 72, -55)
  try {
    await lib.setSpawn();
    console.log('Spawn point permanently locked at Base Bed!');
    bot.chat('alpha: Spawn point locked at Base Bed (294, 72, -55)!');
  } catch (e) {
    console.log('setSpawn note:', e.message);
  }

  // Warp into Nether
  console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
  bot.chat('alpha: Entering Nether portal to join Beta & Gamma at Covered Tunnel (44, 65, -145) for Milestone 9 bartering!');
  await globalThis.enterNetherPortal();
}

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 3. In the Nether: march along battle-tested waypoints to Covered Tunnel (44, 65, -145)
if (bot.game.dimension === 'the_nether') {
  bot.activateItem(true); // Raise shield against Ghasts!
  globalThis.configureFireAvoidance();

  // Full safe waypoints from autoload avoiding all fire pits and cliff drops
  const SAFE_WAYPOINTS = [
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
    { x: 44, y: 65, z: -127 },
    { x: 44, y: 65, z: -145 }
  ];

  console.log('Marching along 16 safe Nether waypoints to Covered Tunnel (44, 65, -145)...');
  for (let i = 0; i < SAFE_WAYPOINTS.length; i++) {
    if (checkCancelled()) break;
    const wp = SAFE_WAYPOINTS[i];
    if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 2.5) continue;

    console.log(`Advancing to WP ${i + 1}/${SAFE_WAYPOINTS.length} (${wp.x}, ${wp.y}, ${wp.z})...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 5000 }); } catch (e2) {}
    }

    // Vacuum drops along the way
    await lib.pickup(3.5);
  }

  // 4. Arrived at Covered Tunnel (44, 65, -145)
  console.log('United at Covered Tunnel! Alpha pos:', lib.fmt(bot.entity.position));
  await lib.pickup(6.0);

  // Check teammates
  for (const name of ['beta', 'gamma', 'delta']) {
    const p = bot.players[name]?.entity;
    if (p) {
      console.log(`Teammate ${name} at ${lib.fmt(p.position)} (dist ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
    }
  }

  const pearls = lib.count('ender_pearl');
  console.log(`=== Milestone 9 Progress: Alpha holds ${pearls}/12 Ender Pearls ===`);
  bot.chat(`alpha: United with Beta & Gamma at Covered Tunnel (44, 65, -145)! Ender Pearls: ${pearls}/12, HP: ${bot.health.toFixed(1)}/20`);
}

console.log('=== Program 717 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
