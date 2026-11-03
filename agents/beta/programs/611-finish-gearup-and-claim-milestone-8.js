// programs/611-finish-gearup-and-claim-milestone-8.js
console.log('=== Step: Craft Stone Tools, Mine 32 Cobble, Warp to Nether & Slay Blazes ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Convert all logs to planks
for (const item of bot.inventory.items()) {
  if (item.name.endsWith('_log')) {
    const pName = item.name.replace('_log', '_planks');
    const r = bot.recipesFor(mcData.itemsByName[pName].id, null, 1, null)[0];
    if (r) {
      try {
        await bot.craft(r, item.count, null);
        console.log(`Crafted ${pName}! Count:`, lib.count(pName));
      } catch (e) {}
    }
  }
}

// 2. Craft sticks
if (lib.count('stick') < 4) {
  const pItem = bot.inventory.items().find(i => i.name.endsWith('_planks'));
  if (pItem) {
    const rStick = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
    if (rStick) {
      try { await bot.craft(rStick, 1, null); } catch (e) {}
    }
  }
}
console.log('Planks:', lib.count('*_planks'), 'Sticks:', lib.count('stick'));

// 3. Walk to base crafting table at (295, 72, -56)
console.log('Walking to base crafting table at (295, 72, -56)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(295, 72, -56, 1));
} catch (e) {
  try { await lib.goTo(295, 72, -56, 1, { dig: false }); } catch (e2) {}
}

// Craft wooden pickaxe
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  await lib.craft('wooden_pickaxe', 1);
  console.log('Wooden pickaxe crafted!');
}

// 4. Walk to mine shaft at (301, 71, -44)
console.log('Walking to mine shaft at (301, 71, -44)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1));
} catch (e) {
  await lib.goTo(301, 71, -44, 1, { dig: false });
}

// 5. Mine 3 stone for stone pickaxe
console.log('Mining stone for stone pickaxe...');
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
  console.log('Stone pickaxe ready!');
}

// 6. Mine stone for stone_sword and 32 cobblestone
console.log('Mining 32 cobblestone with stone pickaxe...');
let digs = 0;
while (lib.count('cobblestone') < 32 && digs < 40 && !isCancelled()) {
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

if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') < 1) {
  if (lib.count('stick') < 1) await lib.craft('stick', 4);
  await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
  console.log('Stone sword crafted and equipped!');
}

console.log('Cobblestone ready:', lib.count('cobblestone'), 'Inv:', JSON.stringify(lib.inv()));
await lib.equipWeapon();

// 7. Sprint into Nether portal at (299.5, 73, -54)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting into Nether portal at (299.5, 73, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
}

// 8. Wait for Nether warp
const startDim = bot.game.dimension;
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}`);
    break;
  }
}

// 9. Step out of portal into bunker
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
  console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));

  // 10. March through proven East Ridge waypoints to Spawner Balcony
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

  console.log('At (37, 65, -184)! Current pos:', lib.fmt(bot.entity.position));

  // 11. Bridge the 2-block gap to Spawner Balcony
  console.log('Bridging gap to Spawner Balcony at (35, 67, -187)...');
  try {
    await lib.place('cobblestone', 36, 65, -185);
    console.log('Placed step 1 at (36, 65, -185)!');
  } catch (e) {}

  try {
    await lib.place('cobblestone', 36, 66, -186);
    console.log('Placed step 2 at (36, 66, -186)!');
  } catch (e) {}

  try {
    await lib.place('cobblestone', 35, 67, -187);
    console.log('Placed connection at (35, 67, -187)!');
  } catch (e) {}

  // Step onto Spawner Balcony deck!
  console.log('Stepping onto Spawner Balcony deck at (34, 67, -187)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(34, 67, -187, 1));
    console.log('SPAWNER BALCONY DECK REACHED!');
  } catch (e) {
    console.log('Deck step note:', e.message);
  }

  // 12. Slay Blazes safely from cover & farm 7+ Blaze Rods
  console.log('Engaging Blazes safely from cover...');
  let rounds = 0;
  while (rounds < 35 && !isCancelled()) {
    rounds++;
    const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 5);
    if (blaze) {
      console.log(`Striking Blaze at dist ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m...`);
      await lib.equipWeapon();
      await bot.lookAt(blaze.position.offset(0, 1.0, 0), true);
      bot.attack(blaze);
      await sleep(650);
    } else {
      await sleep(400);
    }

    // Collect drops
    const gained = await lib.pickup(6);
    if (gained > 0) {
      console.log('Drops picked up! Current blaze_rods:', lib.count('blaze_rod'));
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
