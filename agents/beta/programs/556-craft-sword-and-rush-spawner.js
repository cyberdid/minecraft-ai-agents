// programs/556-craft-sword-and-rush-spawner.js
console.log('=== Step: Craft Stone Sword, Enter Nether, and March to Spawner ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Craft sticks & stone sword
try {
  await lib.craft('stick', 4);
  await lib.craft('stone_sword', 1);
  console.log('SUCCESS: Crafted stone_sword!');
} catch (e) {
  console.log('Sword craft note:', e.message);
}

// Equip stone weapons
await lib.equipWeapon();
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');

console.log('Inventory now:', bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', '));

// 2. Walk South 21m to Nether Portal at (298, 73, -54)
const portalTarget = new Vec3(298.5, 73.0, -54.0);
console.log(`Walking South to Nether Portal at ${lib.fmt(portalTarget)}...`);

try {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 1.0, { dig: true });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(portalTarget.x, portalTarget.y, portalTarget.z, 1));
  } catch (e2) {}
}

// Step into nether_portal block
const portals = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 8, count: 5 });
if (portals.length > 0) {
  const p = portals[0];
  console.log(`Stepping into portal block at ${lib.fmt(p)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(p.x, p.y, p.z));
  } catch (e) {
    await bot.lookAt(new Vec3(p.x + 0.5, p.y + 0.5, p.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.clearControlStates();
  }
} else {
  try { await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5); } catch (e) {}
}

bot.clearControlStates();
console.log('Standing completely still inside portal at:', lib.fmt(bot.entity.position));

// 3. Wait for Nether warp (80 ticks = 4.0s)
const startDim = bot.game.dimension;
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

// 4. March across Nether East Ridge
if (bot.game.dimension.includes('nether')) {
  console.log('SUCCESS: Inside the Nether! Marching to mountain breach and Blaze Spawner...');
  bot.chat(`beta: In Nether at ${lib.fmt(bot.entity.position)} armed with stone sword & pickaxe! Advancing to join Alpha & Delta at Blaze Spawner.`);

  // Step East out of bunker
  try {
    await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 1));
  } catch (e) {
    await bot.lookAt(new Vec3(46, 65, -7), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.clearControlStates();
  }

  // Safe ridge waypoints
  const waypoints = [
    new Vec3(63, 64, -5),
    new Vec3(63, 66, -20),
    new Vec3(63, 66, -35),
    new Vec3(62, 67, -50),
    new Vec3(61, 67, -65),
    new Vec3(54, 65, -90),
    new Vec3(44, 66, -127),
    new Vec3(44, 65, -135),
    new Vec3(44, 65, -141),
    new Vec3(44, 65, -149),
    new Vec3(44, 65, -160)
  ];

  for (let i = 0; i < waypoints.length; i++) {
    if (isCancelled()) break;
    const wp = waypoints[i];
    console.log(`Advancing to Nether WP ${i+1}/${waypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);

    // Put out any nearby fire within 3m
    const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
    const fires = bot.findBlocks({ matching: fireIds, maxDistance: 3, count: 4 });
    for (const fp of fires) {
      try { await lib.dig(fp.x, fp.y, fp.z); } catch (e) {}
    }

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
      console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
    } catch (err) {
      console.log(`WP ${i+1} path note:`, err.message);
    }

    // Pick up drops
    await lib.pickup(6);
    await lib.equipWeapon();

    // Defend if attacked
    const hostiles = lib.hostiles(8);
    for (const h of hostiles) {
      if (h.dist < 4 && !['zombified_piglin'].includes(h.name)) {
        console.log(`Fighting hostile ${h.name} at dist ${h.dist}...`);
        try { await lib.fight(4, 4); } catch (e) {}
      }
    }
  }

  console.log('Arrived at final position in Nether:', lib.fmt(bot.entity.position));
  const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
  console.log('Inventory now:', inv);

  if (bot.entity.position.z <= -140) {
    bot.chat(`beta: At mountain breach/tunnel (${lib.fmt(bot.entity.position)})! Ready to breach Blaze Spawner (32, 68, -190)!`);
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health
};
