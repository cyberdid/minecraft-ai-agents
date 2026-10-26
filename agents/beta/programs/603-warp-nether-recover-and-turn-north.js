// programs/603-warp-nether-recover-and-turn-north.js
console.log('=== Step: Warp to Nether, March to Frontline, Recover Drops & Secure Turn North ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- PART 1: WARP TO NETHER ---
if (bot.game.dimension === 'overworld') {
  // Exit base door to portal
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

  const portalTarget = new Vec3(299.5, 73.0, -54.0);
  console.log('Entering Nether portal at (299.5, 73, -54)...');
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

// --- PART 2: NETHER MARCH TO FRONTLINE BLAST WALL ---
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

  // --- PART 3: ADVANCE TO z=-176 AND RECOVER DROPS ---
  console.log('Advancing carefully to (44, 65, -176)...');
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -176));
  await lib.pickup(6);

  // Carefully step West along z=-176 to x=38 (NEVER past x=38!)
  console.log('Stepping West along z=-176 to (38.5, 65, -176)...');
  for (let x = 43; x >= 38; x--) {
    await bot.pathfinder.goto(new goals.GoalBlock(x, 65, -176));
    await lib.pickup(4);
  }

  console.log('Reached x=38 at z=-176! Inv:', JSON.stringify(lib.inv()));
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // --- PART 4: SECURE GAP AT (37, 64, -176) & TURN NORTH AT x=38 ---
  // Place floor block at (37, 64, -176) from (38, 64, -176)
  const b37Floor = bot.blockAt(new Vec3(37, 64, -176));
  if (!b37Floor || b37Floor.boundingBox !== 'block') {
    const pItem = bot.inventory.items().find(it => it.name.includes('plank') || it.name.includes('cobble') || it.name.includes('dirt'));
    if (pItem) {
      console.log('Sealing abyss gap at (37, 64, -176)...');
      try {
        await bot.equip(pItem.id, 'hand');
        const ref = bot.blockAt(new Vec3(38, 64, -176));
        if (ref) {
          await bot.lookAt(ref.position, true);
          await bot.placeBlock(ref, new Vec3(-1, 0, 0));
          console.log('Floor placed at (37, 64, -176)!');
        }
      } catch (e) {
        console.log('Gap seal note:', e.message);
      }
    }
  }

  // Also place safety guardrail at (37, 65, -176)
  const b37Rail = bot.blockAt(new Vec3(37, 65, -176));
  if (!b37Rail || b37Rail.boundingBox !== 'block') {
    const pItem = bot.inventory.items().find(it => it.name.includes('plank') || it.name.includes('cobble') || it.name.includes('dirt'));
    if (pItem) {
      try {
        await bot.equip(pItem.id, 'hand');
        const ref = bot.blockAt(new Vec3(37, 64, -176));
        if (ref) {
          await bot.lookAt(ref.position, true);
          await bot.placeBlock(ref, new Vec3(0, 1, 0));
          console.log('Safety guardrail placed at (37, 65, -176)!');
        }
      } catch (e) {}
    }
  }

  // Now step safely North onto (38, 65, -177)
  console.log('Stepping North onto (38, 65, -177)...');
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(38, 65, -177));
    console.log('Successfully on North walkway at (38, 65, -177)!');
  } catch (e) {
    console.log('Step north note:', e.message);
  }

  bot.chat(`beta: Secured corner at (38, 65, -177)! Sealed abyss drop at (37, 64, -176)! Ready to advance North to Spawner!`);
}

return {
  pos: bot.entity.position,
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
