// programs/635-reach-pillbox-and-claim-milestone-8.js
console.log('=== Program 635: March Remaining Corridor & Claim Milestone 8 ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Equip stone sword
await lib.equipWeapon();

// Configure strict fire, soul_fire & lava avoidance
console.log('Configuring fire & lava avoidance movements...');
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowSprinting = true;
bot.pathfinder.setMovements(moves);

// Remaining waypoints from z=-100 to Spawner Balcony
const remainingWaypoints = [
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127), // Fortress Workshop Outpost
  new Vec3(44, 65, -145), // Covered tunnel mid
  new Vec3(44, 65, -160), // Covered tunnel north
  new Vec3(44, 65, -169), // Frontline blast wall
  new Vec3(44, 65, -176), // Cross-bridge junction
  new Vec3(38, 65, -176), // Sealed cross-bridge
  new Vec3(38, 65, -178), // Corner turn
  new Vec3(37, 65, -184), // North walkway end
  new Vec3(35, 67, -186)  // Balcony entrance
];

for (let i = 0; i < remainingWaypoints.length && !isCancelled(); i++) {
  const wp = remainingWaypoints[i];
  console.log(`[WP ${i + 1}/${remainingWaypoints.length}] Moving to (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    console.log(`WP ${i + 1} note:`, e.message);
  }
}

console.log('At front! Current Pos:', lib.fmt(bot.entity.position));

// --- Phase 2: Seal Floor Pit and Build Anti-Knockback Pillbox ---
console.log('--- Phase 2: Constructing Blast-Proof Pillbox ---');
if (lib.count('cobblestone') > 0) {
  // 1. Seal floor pit at (33, 66, -187)
  try {
    await lib.place('cobblestone', 33, 66, -187);
    console.log('Sealed floor pit at (33, 66, -187)!');
  } catch (e) {}

  // 2. Anti-knockback back wall behind us at y=68, z=-187
  try {
    await lib.place('cobblestone', 34, 68, -187);
    console.log('Anti-knockback back wall placed at (34, 68, -187)!');
  } catch (e) {}
}

// Step onto deck inside pillbox at (34, 68, -188)
try {
  await bot.pathfinder.goto(new goals.GoalNear(34, 68, -188, 1));
  console.log('INSIDE PILLBOX DECK at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Step note:', e.message);
}

// 3. Place front head cover at (34, 69, -189) with strike slit at y=68
if (lib.count('cobblestone') > 0) {
  try {
    await lib.place('cobblestone', 34, 69, -189);
    console.log('Front head cover placed at (34, 69, -189)!');
  } catch (e) {}
}

// 4. Vacuum dropped shield, weapons, and items on deck
console.log('Vacuuming dropped items...');
await lib.pickup(10);
await lib.equipArmor();
await lib.equipWeapon();
console.log('Equipped gear! Held:', bot.inventory.selectedItem?.name, 'Inv:', JSON.stringify(lib.inv()));

// --- Phase 3: Slay Blazes & Harvest 7+ Blaze Rods ---
console.log('=== Phase 3: Slaying Blazes from Protected Pillbox for 7+ Blaze Rods ===');
bot.chat('beta: In Spawner Pillbox with stone sword & cobblestone! Harvesting Blaze Rods for Milestone 8!');

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
      console.log('Drops scooped! Current Blaze Rods:', lib.count('blaze_rod'));
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

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
