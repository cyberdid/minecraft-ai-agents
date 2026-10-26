// programs/606-obtain-loadout-and-warp-nether.js
console.log('=== Step: Obtain Full Stone Loadout via lib.obtain & Warp to Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- PART 1: OVERWORLD GEARUP VIA LIB.OBTAIN ---
if (bot.game.dimension === 'overworld') {
  // Exit base door
  console.log('Exiting base door at (294, 72, -54)...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    console.log('Exited base, now at:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Door exit note:', e.message);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
      await lib.goThroughDoor(294, 72, -54);
    } catch (e2) {}
  }

  // 1. Obtain stone_pickaxe
  console.log('Obtaining stone_pickaxe...');
  await lib.obtain('stone_pickaxe', 1);
  console.log('Have stone_pickaxe! Count:', lib.count('stone_pickaxe'));

  // 2. Obtain stone_sword
  console.log('Obtaining stone_sword...');
  await lib.obtain('stone_sword', 1);
  console.log('Have stone_sword! Count:', lib.count('stone_sword'));

  // 3. Obtain 32 cobblestone
  console.log('Obtaining 32 cobblestone...');
  await lib.obtain('cobblestone', 32);
  console.log('Cobblestone count:', lib.count('cobblestone'));

  // 4. Equip weapon
  await lib.equipWeapon();

  // 5. Sprint into Nether portal at (299.5, 73, -54)
  const portalTarget = new Vec3(299.5, 73.0, -54.0);
  console.log('Sprinting into Nether portal at (299.5, 73, -54)...');
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
  console.log('Marching along proven East Ridge waypoints to Frontline...');
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

  console.log('Frontline reached! Pos:', lib.fmt(bot.entity.position));
  console.log('Inv:', JSON.stringify(lib.inv()));
  bot.chat(`beta: United at Frontline Blast Wall (${lib.fmt(bot.entity.position)}) with stone tools and ${lib.count('cobblestone')} cobble! Ready to breach Spawner!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
