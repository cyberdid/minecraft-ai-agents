// programs/638-nether-sprint-to-pillbox-and-claim-milestone-8.js
console.log('=== Program 638: Sprint to Spawner Pillbox & Claim Milestone 8 ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Step East out of portal bunker to (42, 65, -7)
console.log('Stepping East out of portal bunker...');
await bot.lookAt(new Vec3(46, 65, -7), true);
bot.setControlState('forward', true);
await sleep(1500);
bot.clearControlStates();
console.log('Safely on ridge trail at:', lib.fmt(bot.entity.position));

bot.chat('beta: Sprinting covered corridor to Spawner Pillbox to join Delta and claim Milestone 8!');

// Configure strict fire, soul_fire & lava avoidance
console.log('Configuring strict fire, soul_fire & lava avoidance...');
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowSprinting = true;
bot.pathfinder.setMovements(moves);

const waypoints = [
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
  new Vec3(37, 65, -184), // North walkway end
  new Vec3(35, 67, -186), // Spawner Balcony entrance
  new Vec3(34, 68, -188)  // Inside Spawner Pillbox
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i + 1}/${waypoints.length}] Moving to (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    console.log(`WP ${i + 1} note:`, e.message);
  }
}

console.log('INSIDE SPAWNER PILLBOX! Pos:', lib.fmt(bot.entity.position));

// --- Phase 2: Vacuum Dropped Gear, Equip Shield & Sword ---
console.log('--- Phase 2: Vacuuming Dropped Gear & Equipping ---');
await lib.pickup(10);
await sleep(300);
await lib.pickup(10);
console.log('Inventory after pickup:', JSON.stringify(lib.inv()));

await lib.equipArmor();
await lib.equipWeapon();
console.log('Equipped gear! Held:', bot.inventory.selectedItem?.name);

// If we picked up cobblestone, ensure pit at (33, 66, -187) and back wall at (34, 68, -187) are sealed
if (lib.count('cobblestone') > 0) {
  try { await lib.place('cobblestone', 33, 66, -187); } catch (e) {}
  try { await lib.place('cobblestone', 34, 68, -187); } catch (e) {}
}

// --- Phase 3: Slay Blazes & Harvest 7+ Blaze Rods ---
console.log('=== Phase 3: Slaying Blazes from Protected Pillbox for 7+ Blaze Rods ===');
bot.chat('beta: Armed in Spawner Pillbox! Slaying Blazes to claim Milestone 8!');

let rounds = 0;
while (rounds < 80 && !isCancelled()) {
  rounds++;
  const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 5.8);
  if (blaze) {
    console.log(`[Round ${rounds}] Striking Blaze at dist ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m (HP: ${blaze.metadata?.[9] || '?'})...`);
    await lib.equipWeapon();
    await bot.lookAt(blaze.position.offset(0, 0.5, 0), true);
    bot.attack(blaze);
    await sleep(620);
  } else {
    // Check if wither skeleton or other hostile is near slit
    const ws = bot.nearestEntity(e => ['wither_skeleton', 'piglin'].includes(e.name) && bot.entity.position.distanceTo(e.position) < 4.0);
    if (ws) {
      console.log(`Defending against ${ws.name} at dist ${bot.entity.position.distanceTo(ws.position).toFixed(1)}m...`);
      await lib.equipWeapon();
      await bot.lookAt(ws.position.offset(0, 1.0, 0), true);
      bot.attack(ws);
      await sleep(620);
    } else {
      await sleep(350);
    }
  }

  // Scoop drops frequently
  if (rounds % 2 === 0) {
    const gained = await lib.pickup(6);
    if (gained > 0) {
      console.log('Drops scooped! Current Blaze Rods:', lib.count('blaze_rod'), 'Inv:', JSON.stringify(lib.inv()));
    }
  }

  // Check Milestone 8 condition
  if (lib.count('blaze_rod') >= 7) {
    console.log('====================================');
    console.log('MILESTONE 8 COMPLETE! 7+ BLAZE RODS!');
    console.log('====================================');
    bot.chat(`beta: MILESTONE 8 COMPLETE! Harvested ${lib.count('blaze_rod')} Blaze Rods from Spawner!`);
    break;
  }
}

// Final pickup
await lib.pickup(10);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
