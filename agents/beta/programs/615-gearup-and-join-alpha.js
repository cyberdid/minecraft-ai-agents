// programs/615-gearup-and-join-alpha.js
console.log('=== Program 615: Gear Up & Join Alpha on Spawner Balcony ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- Phase 1: Exit Base & Harvest 4 Logs ---
console.log('--- Phase 1: Exit base & gather wood ---');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Outside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goThroughDoor note:', e.message);
}

// Gather 4 logs
console.log('Collecting 4 logs...');
try {
  await lib.collect('*_log', 4, { maxDistance: 45 });
  console.log('Logs collected! Count:', lib.count('*_log'));
} catch (e) {
  console.log('lib.collect log note:', e.message);
}

// Convert logs to planks
for (const item of bot.inventory.items()) {
  if (item.name.endsWith('_log')) {
    const pName = item.name.replace('_log', '_planks');
    const r = bot.recipesFor(mcData.itemsByName[pName].id, null, 1, null)[0];
    if (r) {
      try {
        await bot.craft(r, item.count, null);
        console.log(`Crafted ${pName}! Planks:`, lib.count('*_planks'));
      } catch (e) {}
    }
  }
}

// Craft sticks
if (lib.count('stick') < 8 && lib.count('*_planks') >= 4) {
  const rStick = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (rStick) {
    try {
      await bot.craft(rStick, 2, null);
      console.log('Crafted sticks! Sticks:', lib.count('stick'));
    } catch (e) {}
  }
}

// Craft portable crafting table
if (lib.count('crafting_table') < 1 && lib.count('*_planks') >= 4) {
  const rCt = bot.recipesFor(mcData.itemsByName.crafting_table.id, null, 1, null)[0];
  if (rCt) {
    try {
      await bot.craft(rCt, 1, null);
      console.log('Crafted crafting table!');
    } catch (e) {}
  }
}

// Walk to mine shaft at (301, 71, -44)
console.log('Walking to mine shaft at (301, 71, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1.5));
} catch (e) {
  try { await lib.goTo(301, 71, -44, 1.5, { dig: false }); } catch (e2) {}
}

// Place crafting table at (301, 72, -45)
const nearbyCt = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 6 });
if (!nearbyCt && lib.count('crafting_table') >= 1) {
  console.log('Placing crafting table at (301, 72, -45)...');
  try { await lib.place('crafting_table', 301, 72, -45); } catch (e) {}
}

// Craft wooden pickaxe
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  console.log('Crafting wooden pickaxe...');
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Wooden pickaxe ready!');
  } catch (e) {
    console.log('Wooden pick craft note:', e.message);
  }
}

// --- Phase 2: Mine Stone, Craft Stone Pickaxe & Stone Sword, Mine Cobblestone ---
console.log('--- Phase 2: Mine stone & craft stone gear ---');
// 2a. Mine 3 stone
for (let s = 0; s < 8; s++) {
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

// Craft stone pickaxe
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') < 1) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe ready! Count:', lib.count('stone_pickaxe'));
  } catch (e) {
    console.log('Stone pick craft note:', e.message);
  }
}

// 2b. Mine 24+ cobblestone
console.log('Mining 24+ cobblestone with stone pickaxe...');
let digs = 0;
while (lib.count('cobblestone') < 24 && digs < 35 && !isCancelled()) {
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

// 2c. Craft stone sword
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') < 1) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword ready! Count:', lib.count('stone_sword'));
  } catch (e) {
    console.log('Stone sword craft note:', e.message);
  }
}

console.log('Gear ready! Cobblestone:', lib.count('cobblestone'), 'Inv:', JSON.stringify(lib.inv()));
await lib.equipWeapon();

// --- Phase 3: Warp to Nether ---
console.log('--- Phase 3: Sprinting into Nether portal at (298, 72, -54) ---');
const portalTarget = new Vec3(298.0, 72.0, -54.0);
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  try { await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false }); } catch (e2) {}
}

const startDim = bot.game.dimension;
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim || bot.game.dimension.includes('nether')) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}`);
    break;
  }
}

// --- Phase 4: Nether March to Spawner Balcony Frontline ---
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
  console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));

  bot.chat('beta: In Nether bunker armed with stone sword & cobblestone! Advancing to Spawner!');

  console.log('Configuring strict fire, soul_fire & lava avoidance...');
  const moves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  bot.pathfinder.setMovements(moves);

  const safeWaypoints = [
    new Vec3(46, 65, -8),
    new Vec3(52, 65, -8),
    new Vec3(63, 64, -8),
    new Vec3(63, 66, -20),
    new Vec3(63, 66, -35),
    new Vec3(62, 67, -50),
    new Vec3(61, 67, -65),
    new Vec3(62, 67, -80),
    new Vec3(61, 66, -100),
    new Vec3(50, 65, -115),
    new Vec3(44, 65, -127), // Fortress Workshop Outpost
    new Vec3(44, 65, -145), // Covered tunnel mid
    new Vec3(44, 65, -160), // Covered tunnel north
    new Vec3(44, 65, -169), // Frontline blast wall
    new Vec3(44, 65, -176), // Cross-bridge junction
    new Vec3(38, 65, -176), // Sealed cross-bridge
    new Vec3(38, 65, -178), // Corner turn
    new Vec3(37, 65, -184)  // North walkway end
  ];

  for (let i = 0; i < safeWaypoints.length && !isCancelled(); i++) {
    const wp = safeWaypoints[i];
    console.log(`[WP ${i + 1}/${safeWaypoints.length}] Moving to (${wp.x}, ${wp.y}, ${wp.z})...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
    } catch (e) {
      console.log(`Path note to WP ${i + 1}:`, e.message);
    }
  }

  console.log('At front! Current pos:', lib.fmt(bot.entity.position));

  // --- Phase 5: Bridge 2-block gap to Spawner Balcony deck ---
  if (lib.count('cobblestone') > 0) {
    console.log('Placing bridge steps to deck at (35, 67, -187)...');
    try { await lib.place('cobblestone', 36, 65, -185); } catch (e) {}
    try { await lib.place('cobblestone', 36, 66, -186); } catch (e) {}
    try { await lib.place('cobblestone', 35, 67, -187); } catch (e) {}
  }

  console.log('Stepping onto Spawner Balcony deck...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(34, 67, -187, 1));
    console.log('SUCCESS: On Spawner Balcony Deck at:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Balcony step note:', e.message);
  }

  // --- Phase 6: Slay Blazes with Alpha & Harvest Blaze Rods ---
  console.log('--- Phase 6: Slaying Blazes & Harvesting Blaze Rods ---');
  let rounds = 0;
  while (rounds < 40 && !isCancelled()) {
    rounds++;
    const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 5.5);
    if (blaze) {
      console.log(`Attacking Blaze at dist ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m...`);
      await lib.equipWeapon();
      await bot.lookAt(blaze.position.offset(0, 1.0, 0), true);
      bot.attack(blaze);
      await sleep(600);
    } else {
      await sleep(400);
    }

    const gained = await lib.pickup(6);
    if (gained > 0) {
      console.log('Picked up items! Blaze rods:', lib.count('blaze_rod'));
    }

    if (lib.count('blaze_rod') >= 7) {
      console.log('*** MILESTONE 8 ACHIEVED: 7+ BLAZE RODS ***');
      bot.chat(`beta: MILESTONE 8 COMPLETE! Harvested ${lib.count('blaze_rod')} Blaze Rods!`);
      break;
    }
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
