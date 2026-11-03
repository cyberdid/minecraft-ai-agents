// programs/645-enter-nether-and-spawner.js
console.log('=== Program 645: Enter Nether & Blaze Conquest (Milestone 8) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- Phase 1: Step Directly into Nether Portal ---
console.log('--- Phase 1: Stepping into Portal at (299.5, 73.0, -54.0) ---');

// If in overworld, walk into portal
if (!bot.game.dimension.includes('nether')) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const target = new Vec3(299.5, 73.0, -54.0);
    console.log(`Walking into portal target ${target}, current pos: ${lib.fmt(bot.entity.position)}`);
    await bot.lookAt(target, true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(1200);
    bot.clearControlStates();

    const dist = bot.entity.position.distanceTo(target);
    console.log(`Distance to portal center: ${dist.toFixed(2)}m`);
    if (dist < 1.2) {
      console.log('Inside nether portal block! Holding position for warp...');
      break;
    }
    await sleep(500);
  }

  // Wait for Nether dimension change (up to 20s)
  const startDim = bot.game.dimension;
  for (let s = 0; s < 20; s++) {
    await sleep(1000);
    if (isCancelled()) break;
    if (bot.game.dimension !== startDim || bot.game.dimension.includes('nether')) {
      console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}`);
      break;
    }
  }
}

if (!bot.game.dimension.includes('nether')) {
  console.log('Still in overworld. Checking position:', lib.fmt(bot.entity.position));
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

// --- Phase 2: March Safe Corridor to Spawner Pillbox ---
console.log('--- Phase 2: Safe March to Spawner Pillbox ---');
// Step forward out of Nether portal frame
await bot.lookAt(new Vec3(46, 65, -7), true);
bot.setControlState('forward', true);
await sleep(1500);
bot.clearControlStates();

bot.chat('beta: In Nether! Fast-marching to Spawner Pillbox at (34, 68, -188)!');

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
  console.log(`Advancing to WP ${i+1}/${safeWaypoints.length}: ${wp}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    console.log(`WP ${i+1} path error:`, e.message);
  }
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

// --- Phase 3: Slay Blazes & Harvest 7+ Blaze Rods ---
console.log('=== Phase 3: Slaying Blazes from Protected Pillbox for 7+ Blaze Rods ===');
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
    // If shield in off-hand (slot 45), hold shield active
    if (bot.inventory.slots[45]?.name === 'shield') {
      try { bot.activateItem(true); } catch (e) {}
    }
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

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
