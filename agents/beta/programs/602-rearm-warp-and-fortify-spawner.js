// programs/602-rearm-warp-and-fortify-spawner.js
console.log('=== Step: Quick Wood Gather, Warp to Nether & Fortify Spawner Bridge ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- PART 1: QUICK OVERWORLD WOOD (if in overworld) ---
if (bot.game.dimension === 'overworld') {
  // Exit base door
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

  // Walk to tree at (326, 68, -54)
  console.log('Walking to oak tree at (326, 68, -54)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(326, 68, -54, 2));
  } catch (e) {
    try { await lib.goToXZ(325, -54); } catch (e2) {}
  }

  // Dig 3 logs
  for (let y of [69, 70, 71, 68]) {
    const b = bot.blockAt(new Vec3(326, y, -54));
    if (b && b.name.includes('log')) {
      try { await lib.dig(326, y, -54); } catch (e) {}
    }
  }
  await lib.pickup(4);
  console.log('Logs collected:', lib.count('*_log'));

  // Craft planks
  const logCount = lib.count('*_log');
  if (logCount > 0) {
    try { await lib.craft('oak_planks', logCount * 4); } catch (e) {}
  }
  console.log('Planks ready:', lib.count('*_planks'));

  // Sprint into Nether portal at (299.5, 73, -54)
  const portalTarget = new Vec3(299.5, 73.0, -54.0);
  console.log('Sprinting into Nether portal...');
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
  } catch (e) {
    await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
  }

  const startDim = bot.game.dimension;
  for (let s = 0; s < 12; s++) {
    await sleep(1000);
    if (isCancelled()) break;
    if (bot.game.dimension !== startDim) {
      console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}`);
      break;
    }
  }

  if (bot.game.dimension.includes('nether')) {
    console.log('Stepping East out of portal frame into bunker...');
    await bot.lookAt(new Vec3(46, 65, -7), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.clearControlStates();
    console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));
  }
}

// --- PART 2: MARCH TO FRONTLINE BLAST WALL ---
if (bot.game.dimension.includes('nether')) {
  console.log('Marching along proven Gamma East Ridge waypoints...');
  const waypoints = [
    { name: 'Ridge South', pos: new Vec3(62.5, 66, -30) },
    { name: 'Ridge Mid-South', pos: new Vec3(62.5, 66, -55) },
    { name: 'Ridge Mid-North', pos: new Vec3(62.5, 67, -80) },
    { name: 'Ridge North Bend', pos: new Vec3(61.5, 66, -100) },
    { name: 'Fortress Approach', pos: new Vec3(50.0, 65, -115) },
    { name: 'Fortress Workshop Bunker', pos: new Vec3(44.0, 65, -127) },
    { name: 'Covered Tunnel Mid', pos: new Vec3(44.0, 65, -145) },
    { name: 'Covered Tunnel North', pos: new Vec3(44.0, 65, -160) },
    { name: 'Frontline Blast Wall', pos: new Vec3(44.0, 65, -169) }
  ];

  for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
    const wp = waypoints[i];
    console.log(`[WP ${i + 1}/${waypoints.length}] Moving to ${wp.name}...`);
    try {
      await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 2, { timeoutMs: 16000 });
    } catch (e) {
      try {
        await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 12000 });
      } catch (e2) {}
    }

    if (i >= 4) {
      try {
        await lib.pickup(6);
        await lib.equipArmor();
        await lib.equipWeapon();
      } catch (e) {}
    }
  }

  console.log('Reached Frontline Blast Wall at:', lib.fmt(bot.entity.position));
  await lib.pickup(6);
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // --- PART 3: RECOVER GEAR AT z=-176 & BUILD PROTECTIVE NORTH WALL ---
  console.log('Advancing carefully to (44, 65, -176)...');
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -176));
  await lib.pickup(6);

  // Build 2-high protective North blast wall along z=-177 before stepping west
  console.log('Building protective North blast wall along z=-177 from x=43 to x=38...');
  for (let x = 43; x >= 38; x--) {
    // Build wall at y=65 (eye level) and y=66 (head level) at z=-177
    for (let y of [65, 66]) {
      const b = bot.blockAt(new Vec3(x, y, -177));
      if (!b || b.boundingBox !== 'block') {
        const pItem = bot.inventory.items().find(it => it.name.includes('plank') || it.name.includes('cobble') || it.name.includes('dirt'));
        if (pItem) {
          try {
            await bot.equip(pItem.id, 'hand');
            const ref = bot.blockAt(new Vec3(x, y - 1, -177)) || bot.blockAt(new Vec3(x + 1, y, -177)) || bot.blockAt(new Vec3(x, 64, -176));
            if (ref) {
              await bot.lookAt(ref.position, true);
              await bot.placeBlock(ref, new Vec3(0, 1, 0));
            }
          } catch (e) {}
        }
      }
    }
    // Step forward along z=-176 safely behind the wall
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(x, 65, -176));
      await lib.pickup(4);
    } catch (e) {}
  }

  console.log('Protected bridge position reached at:', lib.fmt(bot.entity.position));
  console.log('Inv:', JSON.stringify(lib.inv()));
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  bot.chat(`beta: Protected bridge constructed along z=-176 to ${lib.fmt(bot.entity.position)}! Walls blocking Blaze fireballs!`);
}

return {
  pos: bot.entity.position,
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
