// programs/604-safe-corridor-spawner-assault.js
console.log('=== Step: Overworld Gearup, Nether March & Safe Enclosed Tunnel to Spawner ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- PART 1: OVERWORLD GEARUP (if in overworld) ---
if (bot.game.dimension === 'overworld') {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

  // Harvest 4 oak logs at (326, 68, -54)
  console.log('Walking to oak tree at (326, 68, -54)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(326, 68, -54, 2));
  } catch (e) {
    try { await lib.goToXZ(325, -54); } catch (e2) {}
  }

  for (let y of [69, 70, 71, 68, 67]) {
    const b = bot.blockAt(new Vec3(326, y, -54));
    if (b && b.name.includes('log')) {
      try { await lib.dig(326, y, -54); } catch (e) {}
    }
  }
  await lib.pickup(4);
  console.log('Logs collected:', lib.count('*_log'));

  // Craft planks, sticks, wooden pickaxe
  const logCount = lib.count('*_log');
  if (logCount > 0) {
    try { await lib.craft('oak_planks', logCount * 4); } catch (e) {}
  }
  if (lib.count('stick') < 4) {
    try { await lib.craft('stick', 4); } catch (e) {}
  }
  if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
    await lib.craft('wooden_pickaxe', 1);
  }

  // Walk to mine shaft at (301, 71, -44)
  console.log('Walking to mine shaft at (301, 71, -44)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1));
  } catch (e) {
    await lib.goTo(301, 71, -44, 1, { dig: false });
  }

  // Mine stone for stone pickaxe & sword
  for (let s = 0; s < 6; s++) {
    if (lib.count('cobblestone') >= 3) break;
    const stone = bot.findBlock({
      matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id, mcData.blocksByName.andesite?.id].filter(Boolean),
      maxDistance: 4,
      useExtraInfo: (b) => b.position.y <= 71
    });
    if (stone) {
      try {
        await lib.dig(stone.position.x, stone.position.y, stone.position.z);
        await lib.pickup(3);
      } catch (e) {}
    }
  }

  if (lib.count('cobblestone') >= 3) {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    if (lib.count('stone_pickaxe') < 1) await lib.craft('stone_pickaxe', 1);
    if (lib.count('stone_sword') < 1) await lib.craft('stone_sword', 1);
    await lib.equipWeapon();
    console.log('Stone tools crafted!');
  }

  // Mine 25 cobblestone
  console.log('Mining 25 cobblestone...');
  let digs = 0;
  while (lib.count('cobblestone') < 25 && digs < 32 && !isCancelled()) {
    digs++;
    const stone = bot.findBlock({
      matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id, mcData.blocksByName.andesite?.id].filter(Boolean),
      maxDistance: 4,
      useExtraInfo: (b) => b.position.y <= 71 && (b.position.x >= 298 || b.position.z >= -48)
    });
    if (stone) {
      try {
        await lib.dig(stone.position.x, stone.position.y, stone.position.z);
        await lib.pickup(3);
      } catch (e) {
        break;
      }
    } else {
      break;
    }
  }
  console.log('Cobblestone ready:', lib.count('cobblestone'));
  await lib.equipWeapon();

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
  console.log('Stepping West along z=-176 to (38, 65, -176)...');
  for (let x = 43; x >= 38; x--) {
    await bot.pathfinder.goto(new goals.GoalBlock(x, 65, -176));
    await lib.pickup(4);
  }

  console.log('Reached x=38 at z=-176! Inv:', JSON.stringify(lib.inv()));
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // --- PART 4: FORTIFY WEST WALL & ADVANCE TO z=-184 ---
  console.log('Advancing with continuous West blast wall from z=-178 to z=-184...');
  for (let z = -178; z >= -184; z--) {
    // 1. Place floor at (38, 64, z) if missing
    const fl38 = bot.blockAt(new Vec3(38, 64, z));
    if (!fl38 || fl38.boundingBox !== 'block') {
      try {
        await lib.place('cobblestone', 38, 64, z);
      } catch (e) {}
    }

    // 2. Place floor at (36, 64, z) if missing
    const fl36 = bot.blockAt(new Vec3(36, 64, z));
    if (!fl36 || fl36.boundingBox !== 'block') {
      try {
        await lib.place('cobblestone', 36, 64, z);
      } catch (e) {}
    }

    // 3. Place West blast wall at (36, 65, z)
    const w65 = bot.blockAt(new Vec3(36, 65, z));
    if (!w65 || w65.boundingBox !== 'block') {
      try {
        await lib.place('cobblestone', 36, 65, z);
        console.log(`Placed West wall-lower at (36, 65, ${z})`);
      } catch (e) {}
    }

    // 4. Place West blast wall at (36, 66, z)
    const w66 = bot.blockAt(new Vec3(36, 66, z));
    if (!w66 || w66.boundingBox !== 'block') {
      try {
        await lib.place('cobblestone', 36, 66, z);
        console.log(`Placed West wall-upper at (36, 66, ${z})`);
      } catch (e) {}
    }

    // 5. Step forward safely behind the wall
    try {
      await bot.pathfinder.goto(new goals.GoalBlock(37.5, 65, z));
      await lib.pickup(4);
    } catch (e) {}
  }

  console.log('Fortified walkway complete to z=-184! Pos:', lib.fmt(bot.entity.position));
  console.log('Inv:', JSON.stringify(lib.inv()));
  bot.chat(`beta: Fortified walkway extended to (37.5, 65, -184) with 2-high West blast wall! 8.3m from Spawner!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
