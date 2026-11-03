// programs/626-nether-sprint-and-blaze-harvest.js
console.log('=== Program 626: Nether Sprint, Reclaim Gear & Slay Blazes (Milestone 8) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

bot.chat('beta: Sprinting East Ridge covered corridor to Spawner to claim Milestone 8 with Alpha!');

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
  new Vec3(35, 67, -186)  // Spawner Balcony deck entrance
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i + 1}/${waypoints.length}] Moving to (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    console.log(`Path note to WP ${i + 1}:`, e.message);
  }
}

console.log('On Spawner Balcony Deck! Pos:', lib.fmt(bot.entity.position));

// --- Phase 2: Vacuum Dropped Gear & Equip ---
console.log('--- Phase 2: Vacuuming Dropped Gear ---');
await lib.pickup(10);
console.log('Inventory after pickup:', JSON.stringify(lib.inv()));
await lib.equipArmor();
await lib.equipWeapon();
console.log('Equipped weapon:', bot.inventory.selectedItem?.name);

// --- Phase 3: Slay Blazes & Harvest 7+ Blaze Rods ---
console.log('=== Phase 3: Slaying Blazes for 7+ Blaze Rods ===');
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

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
