// programs/639-solid-gearup-and-blaze-conquest.js
console.log('=== Program 639: Solid Gear-Up & Blaze Conquest (Milestone 8) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- Phase 1: Exit Base to Oak Tree at (272, 70, -78) ---
console.log('--- Phase 1: Exit Base & Harvest Oak Tree ---');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(295, 72, -53, 1, { dig: false });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Outside base. Sprinting to oak tree at (272, 70, -78)...');
try {
  await lib.goTo(273, 70, -77, 1.5, { dig: false, timeoutMs: 18000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(273, 70, -77, 1.5)); } catch (e2) {}
}
console.log('At oak tree:', lib.fmt(bot.entity.position));

// Dig 4-5 oak logs from tree trunk
for (const y of [70, 71, 72, 73, 74]) {
  const b = bot.blockAt(new Vec3(272, y, -78));
  if (b && b.name.includes('log')) {
    try {
      console.log(`Digging log at (272, ${y}, -78)...`);
      await lib.dig(272, y, -78);
    } catch (e) {}
  }
}
await lib.pickup(5);
console.log('Inv after chopping:', JSON.stringify(lib.inv()));

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

// Craft sticks in 2x2
if (lib.count('stick') < 4 && lib.count('*_planks') >= 2) {
  try {
    await lib.craft('stick', 4);
    console.log('Sticks crafted! Count:', lib.count('stick'));
  } catch (e) {}
}

// Craft portable crafting table in 2x2
if (lib.count('crafting_table') < 1 && lib.count('*_planks') >= 4) {
  try {
    await lib.craft('crafting_table', 1);
    console.log('Crafted crafting table!');
  } catch (e) {}
}

// --- Phase 2: Walk to Quarry Ledge & Mine Stone ---
console.log('--- Phase 2: Walking to Quarry Ledge (302, 68, -42) ---');
try {
  await lib.goTo(302, 68, -42, 1, { dig: false, timeoutMs: 25000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalBlock(302, 68, -42)); } catch (e2) {}
}
console.log('At quarry ledge:', lib.fmt(bot.entity.position));

// Ensure crafting table placed nearby
let ct = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 6 });
if (!ct && lib.count('crafting_table') >= 1) {
  try {
    const spot = await lib.freeSpot();
    await lib.place('crafting_table', spot.x, spot.y, spot.z);
    ct = bot.blockAt(spot);
  } catch (e) {}
}

// Craft wooden pickaxe
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  console.log('Crafting wooden pickaxe...');
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Wooden pickaxe ready!');
  } catch (e) {
    console.log('Craft wooden pick note:', e.message);
  }
}

// Equip wooden pickaxe
const wp = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (wp) await bot.equip(wp, 'hand');

// Mine 3 stone for stone pickaxe
console.log('Mining 3 stone for stone pickaxe...');
let dug = 0;
while (lib.count('cobblestone') < 3 && dug < 10 && !isCancelled()) {
  dug++;
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

// Craft stone pickaxe
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') < 1) {
  console.log('Crafting stone pickaxe...');
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe ready! Count:', lib.count('stone_pickaxe'));
  } catch (e) {
    console.log('Stone pick craft note:', e.message);
  }
}

// Equip stone pickaxe
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// Mine 20 cobblestone with stone pickaxe
console.log('Mining 20 cobblestone with stone pickaxe...');
let quarry = 0;
while (lib.count('cobblestone') < 20 && quarry < 30 && !isCancelled()) {
  quarry++;
  const stone = bot.findBlock({
    matching: mcData.blocksByName.stone.id,
    maxDistance: 4.5
  });
  if (stone) {
    try {
      await bot.dig(stone, true);
      await sleep(120);
    } catch (e) {}
  }
}
await lib.pickup(5);

// Craft stone sword
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') < 1) {
  if (lib.count('stick') < 1 && lib.count('*_planks') >= 2) {
    try { await lib.craft('stick', 4); } catch (e) {}
  }
  console.log('Crafting stone sword...');
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword ready! Count:', lib.count('stone_sword'));
  } catch (e) {
    console.log('Stone sword craft note:', e.message);
  }
}

await lib.equipWeapon();
console.log('Armed! Cobblestone:', lib.count('cobblestone'), 'Inv:', JSON.stringify(lib.inv()));

// --- Phase 3: Sprint to Nether Portal ---
console.log('--- Phase 3: Sprinting into Nether portal at (298, 73, -54) ---');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(298, 73, -54));
} catch (e) {
  try { await lib.goTo(298.5, 73.0, -54.0, 0.5, { dig: false }); } catch (e2) {}
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

// --- Phase 4: March Safe Corridor to Spawner Pillbox ---
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();

  bot.chat('beta: Armed with stone sword & cobblestone! Marching to Spawner Pillbox!');

  console.log('Configuring strict fire, soul_fire & lava avoidance...');
  const moves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  moves.allowSprinting = true;
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
    new Vec3(37, 65, -184),
    new Vec3(35, 67, -186),
    new Vec3(34, 68, -188) // Inside Spawner Pillbox
  ];

  for (let i = 0; i < safeWaypoints.length && !isCancelled(); i++) {
    const wp = safeWaypoints[i];
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
    } catch (e) {}
  }

  console.log('INSIDE SPAWNER PILLBOX! Pos:', lib.fmt(bot.entity.position));

  // Ensure floor pit at (33, 66, -187) and back wall at (34, 68, -187) are sealed
  if (lib.count('cobblestone') > 0) {
    try { await lib.place('cobblestone', 33, 66, -187); } catch (e) {}
    try { await lib.place('cobblestone', 34, 68, -187); } catch (e) {}
    try { await lib.place('cobblestone', 35, 68, -187); } catch (e) {}
  }

  // Vacuum dropped shield, weapons, and items on deck
  console.log('Vacuuming dropped items...');
  await lib.pickup(10);
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Equipped gear! Held:', bot.inventory.selectedItem?.name, 'Inv:', JSON.stringify(lib.inv()));

  // --- Phase 5: Slay Blazes & Harvest 7+ Blaze Rods ---
  console.log('=== Phase 5: Slaying Blazes from Protected Pillbox for 7+ Blaze Rods ===');
  bot.chat('beta: Inside Spawner Pillbox! Slaying Blazes to claim Milestone 8!');

  let rounds = 0;
  while (rounds < 80 && !isCancelled()) {
    rounds++;
    const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) <= 4.2);
    if (blaze) {
      console.log(`[Round ${rounds}] Striking Blaze at dist ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m...`);
      await lib.equipWeapon();
      await bot.lookAt(blaze.position.offset(0, 0.5, 0), true);
      bot.attack(blaze);
      await sleep(620);
    } else {
      await sleep(350);
    }

    if (rounds % 2 === 0) {
      const gained = await lib.pickup(6);
      if (gained > 0) {
        console.log('Drops scooped! Current Blaze Rods:', lib.count('blaze_rod'), 'Inv:', JSON.stringify(lib.inv()));
      }
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
