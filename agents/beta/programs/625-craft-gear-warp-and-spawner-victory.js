// programs/625-craft-gear-warp-and-spawner-victory.js
console.log('=== Program 625: Craft Stone Tools, Warp to Nether & Harvest Blaze Rods ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- Phase 1: Craft Stone Pickaxe, Sticks & Stone Sword ---
console.log('--- Phase 1: Crafting Stone Pickaxe & Stone Sword ---');
try {
  await lib.goTo(299, 72, -52, 1.5, { dig: false });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(299, 72, -52, 1.5)); } catch (e2) {}
}

// Craft stone pickaxe
if (lib.count('stone_pickaxe') < 1 && lib.count('cobblestone') >= 3) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted! Count:', lib.count('stone_pickaxe'));
  } catch (e) {
    console.log('Craft stone pickaxe note:', e.message);
  }
}

// Craft sticks if needed
if (lib.count('stick') < 2 && lib.count('*_planks') >= 2) {
  try {
    await lib.craft('stick', 4);
    console.log('Sticks crafted! Count:', lib.count('stick'));
  } catch (e) {}
}

// Craft stone sword
if (lib.count('stone_sword') < 1 && lib.count('cobblestone') >= 2) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted! Count:', lib.count('stone_sword'));
  } catch (e) {
    console.log('Craft stone sword note:', e.message);
  }
}

await lib.equipWeapon();
console.log('Armed! Inv:', JSON.stringify(lib.inv()));

// --- Phase 2: Sprint into Nether Portal at (299.5, 73.0, -54.0) ---
console.log('--- Phase 2: Stepping into Nether portal ---');
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

// --- Phase 3: Fast March through Proven Safe Waypoints to Frontline ---
if (bot.game.dimension.includes('nether')) {
  console.log('Stepping East out of portal bunker to (42, 65, -7)...');
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
  console.log('Safely in Nether bunker at:', lib.fmt(bot.entity.position));

  bot.chat('beta: In Nether bunker armed with stone sword! Marching to unite with Gamma at Spawner!');

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
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
    } catch (e) {}
  }

  console.log('At front! Advancing onto Spawner Balcony deck...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(35, 67, -186, 1));
  } catch (e) {}

  // Vacuum dropped items (swords, cobblestone, shields)
  console.log('Vacuuming dropped items...');
  await lib.pickup(10);
  console.log('Current inv:', JSON.stringify(lib.inv()));
  await lib.equipArmor();
  await lib.equipWeapon();

  // --- Phase 4: Slay Blazes & Harvest 7+ Blaze Rods ---
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
