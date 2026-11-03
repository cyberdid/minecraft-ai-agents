// programs/624-ultimate-blaze-rod-harvest.js
console.log('=== Program 624: Ultimate Blaze Rod Harvest (Milestone 8) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- Phase 1: Exit Base & Gather 3 Logs ---
console.log('--- Phase 1: Exit Base & Gather Logs ---');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Outside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door pass note:', e.message);
}

// Gather 3 logs from nearby trees
console.log('Collecting 3 logs...');
try {
  await lib.collect('*_log', 3, { maxDistance: 35 });
  console.log('Logs collected! Count:', lib.count('*_log'));
} catch (e) {
  console.log('Collect log note:', e.message);
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
if (lib.count('stick') < 4 && lib.count('*_planks') >= 2) {
  try {
    await lib.craft('stick', 4);
    console.log('Sticks crafted! Count:', lib.count('stick'));
  } catch (e) {}
}

// Ensure crafting table at (299, 72, -52)
let ct = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 10 });
if (!ct && lib.count('*_planks') >= 4) {
  try {
    await lib.craft('crafting_table', 1);
    await lib.place('crafting_table', 299, 72, -52);
  } catch (e) {}
}

// Craft wooden pickaxe
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  console.log('Crafting wooden pickaxe...');
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Wooden pickaxe crafted!');
  } catch (e) {
    console.log('Craft wooden pick note:', e.message);
  }
}

// --- Phase 2: Mine Stone at Quarry Ledge (302, 68, -42) ---
console.log('--- Phase 2: Mining Stone at Quarry Ledge ---');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(302, 68, -42));
} catch (e) {
  try { await lib.goTo(302, 68, -42, 1, { dig: false }); } catch (e2) {}
}

// Equip pickaxe
await lib.equipArmor();
const wp = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (wp) await bot.equip(wp, 'hand');

// Dig 3 stone for stone pickaxe
console.log('Mining 3 stone for stone pickaxe...');
let dug = 0;
while (lib.count('cobblestone') < 3 && dug < 6 && !isCancelled()) {
  dug++;
  const stone = bot.findBlock({
    matching: mcData.blocksByName.stone.id,
    maxDistance: 4.5
  });
  if (stone) {
    try {
      await bot.dig(stone, true);
      await sleep(200);
    } catch (e) {}
  }
}
await lib.pickup(5);

// Craft stone pickaxe
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') < 1) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe ready!');
  } catch (e) {}
}

const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// Mine 15 cobblestone with stone pickaxe
console.log('Mining 15 cobblestone...');
let quarry = 0;
while (lib.count('cobblestone') < 15 && quarry < 18 && !isCancelled()) {
  quarry++;
  const stone = bot.findBlock({
    matching: mcData.blocksByName.stone.id,
    maxDistance: 4.5
  });
  if (stone) {
    try {
      await bot.dig(stone, true);
      await sleep(150);
    } catch (e) {}
  }
}
await lib.pickup(5);

// Craft stone sword
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') < 1) {
  if (lib.count('stick') < 1 && lib.count('*_planks') >= 2) {
    try { await lib.craft('stick', 4); } catch (e) {}
  }
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword ready!');
  } catch (e) {}
}

await lib.equipWeapon();
console.log('Armed! Cobblestone:', lib.count('cobblestone'), 'Inv:', JSON.stringify(lib.inv()));

// --- Phase 3: Sprint into Nether Portal at (299.5, 73.0, -54.0) ---
console.log('--- Phase 3: Sprinting into Nether portal ---');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
} catch (e) {
  try { await lib.goTo(299.5, 73.0, -54.0, 0.2, { dig: false }); } catch (e2) {}
}

bot.clearControlStates();
bot.pathfinder.stop();

console.log('Waiting for Nether warp...');
const startDim = bot.game.dimension;
for (let s = 0; s < 18; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim || bot.game.dimension.includes('nether')) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}`);
    break;
  }
}

// --- Phase 4: Sprint Safe Corridor to Spawner Deck ---
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();

  bot.chat('beta: Sprinting to Spawner Balcony with stone sword & cobblestone to claim Milestone 8!');

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
    new Vec3(44, 65, -127),
    new Vec3(44, 65, -145),
    new Vec3(44, 65, -160),
    new Vec3(44, 65, -169),
    new Vec3(44, 65, -176),
    new Vec3(38, 65, -176),
    new Vec3(38, 65, -178),
    new Vec3(37, 65, -184)
  ];

  for (let i = 0; i < safeWaypoints.length && !isCancelled(); i++) {
    const wp = safeWaypoints[i];
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
    } catch (e) {}
  }

  console.log('At front! Advancing onto Spawner Balcony deck...');
  // Place staircase onto balcony deck at y=68
  try { await lib.place('cobblestone', 36, 66, -186); } catch (e) {}
  try { await lib.place('cobblestone', 35, 67, -186); } catch (e) {}
  try { await lib.place('cobblestone', 34, 68, -187); } catch (e) {}

  // Step onto deck at (34, 68, -188)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(34, 68, -188, 1));
    console.log('SUCCESS: ON SPAWNER BALCONY DECK at:', lib.fmt(bot.entity.position));
  } catch (e) {}

  // --- Phase 5: Reclaim Dropped Shield & Weapons ---
  console.log('Vacuuming dropped shield, weapons, and blocks on deck...');
  await lib.pickup(10);
  console.log('Recovered items! Current inv:', JSON.stringify(lib.inv()));
  await lib.equipArmor();
  await lib.equipWeapon();

  // --- Phase 6: Slay Blazes & Harvest 7+ Blaze Rods ---
  console.log('=== Slaying Blazes for 7+ Blaze Rods ===');
  let rounds = 0;
  while (rounds < 60 && !isCancelled()) {
    rounds++;
    const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 5.5);
    if (blaze) {
      console.log(`[Round ${rounds}] Striking Blaze at dist ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m...`);
      await lib.equipWeapon();
      await bot.lookAt(blaze.position.offset(0, 0.5, 0), true);
      bot.attack(blaze);
      await sleep(650);
    } else {
      await sleep(400);
    }

    const gained = await lib.pickup(6);
    if (gained > 0) {
      console.log('Drops scooped! Current Blaze Rods:', lib.count('blaze_rod'));
    }

    if (lib.count('blaze_rod') >= 7) {
      console.log('====================================');
      console.log('MILESTONE 8 COMPLETE! 7+ BLAZE RODS!');
      console.log('====================================');
      bot.chat(`beta: MILESTONE 8 COMPLETE! Harvested ${lib.count('blaze_rod')} Blaze Rods from Spawner!`);
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
