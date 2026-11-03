// programs/663-craft-sword-and-enter-nether.js
console.log('=== Program 663: Craft Swords, Enter Nether & Blaze Conquest ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- Phase 1: Craft Stone Swords & Equip ---
console.log('--- Phase 1: Crafting Stone Swords ---');
try {
  await lib.craft('stone_sword', 2);
  console.log('Crafted stone swords! Count:', lib.count('stone_sword'));
} catch (e) {
  console.log('Craft sword note:', e.message);
}
await lib.equipWeapon();
console.log('Equipped weapon:', bot.inventory.selectedItem?.name);

// --- Phase 2: Walk to Nether Portal & Warp ---
console.log('--- Phase 2: Walking to Nether Portal at (298, 73, -54) ---');
try {
  await lib.goTo(298, 73, -53, 1.5, { dig: false, timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(298, 73, -53, 1.5)); } catch (e2) {}
}

console.log('Stepping directly into Nether portal at (299.5, 73.0, -54.0)...');
for (let attempt = 0; attempt < 5; attempt++) {
  const target = new Vec3(299.5, 73.0, -54.0);
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1200);
  bot.clearControlStates();

  const dist = bot.entity.position.distanceTo(target);
  console.log(`Portal dist: ${dist.toFixed(2)}m, pos: ${lib.fmt(bot.entity.position)}`);
  if (dist < 1.3) {
    console.log('Inside portal block! Holding position for warp...');
    break;
  }
  await sleep(400);
}

// Wait for Nether warp
const startDim = bot.game.dimension;
for (let s = 0; s < 20; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim || bot.game.dimension.includes('nether')) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}`);
    break;
  }
}

if (!bot.game.dimension.includes('nether')) {
  console.log('Failed to warp to Nether. Current pos:', lib.fmt(bot.entity.position));
  return { dimension: bot.game.dimension, pos: bot.entity.position, inv: lib.inv() };
}

// --- Phase 3: March to Spawner Pillbox ---
console.log('--- Phase 3: Marching to Spawner Pillbox ---');
// Step forward out of Nether portal bunker
await bot.lookAt(new Vec3(46, 65, -7), true);
bot.setControlState('forward', true);
await sleep(1500);
bot.clearControlStates();

bot.chat('beta: In Nether with stone swords & 35+ cobble! Marching to Spawner Pillbox!');

// Configure movement with strict fire, soul_fire & lava avoidance
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowSprinting = true;
bot.pathfinder.setMovements(moves);

const waypoints = [
  new Vec3(50, 68, -8),
  new Vec3(63, 65, -10),
  new Vec3(63, 66, -20),
  new Vec3(62, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127), // Fortress Workshop Outpost
  new Vec3(44, 65, -145),
  new Vec3(44, 65, -160),
  new Vec3(44, 65, -169),
  new Vec3(44, 65, -176),
  new Vec3(38, 65, -176),
  new Vec3(38, 65, -178),
  new Vec3(37, 65, -184),
  new Vec3(35, 67, -186),
  new Vec3(34, 68, -188)  // Inside Spawner Pillbox
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i+1}/${waypoints.length}] Navigating to ${wp}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    console.log(`Arrived at WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i+1} path note:`, e.message);
    const d = bot.entity.position.distanceTo(wp);
    if (d < 6) {
      try {
        await bot.lookAt(wp, true);
        bot.setControlState('forward', true);
        await sleep(1000);
        bot.clearControlStates();
      } catch (e2) {}
    }
  }
}

console.log('INSIDE SPAWNER PILLBOX! Pos:', lib.fmt(bot.entity.position));

// Safety block placements to prevent falling into the pit and knockback
if (lib.count('cobblestone') > 0) {
  const pit = bot.blockAt(new Vec3(33, 66, -187));
  if (!pit || pit.name === 'air') {
    console.log('Sealing pit at (33, 66, -187)...');
    try { await lib.place('cobblestone', 33, 66, -187); } catch (e) {}
  }
  const wall1 = bot.blockAt(new Vec3(34, 68, -187));
  if (!wall1 || wall1.name === 'air') {
    console.log('Sealing back wall at (34, 68, -187)...');
    try { await lib.place('cobblestone', 34, 68, -187); } catch (e) {}
  }
  const wall2 = bot.blockAt(new Vec3(35, 68, -187));
  if (!wall2 || wall2.name === 'air') {
    console.log('Sealing back wall at (35, 68, -187)...');
    try { await lib.place('cobblestone', 35, 68, -187); } catch (e) {}
  }
}

// Vacuum dropped gear on the deck
console.log('Vacuuming dropped items...');
await lib.pickup(10);
await lib.equipArmor();
await lib.equipWeapon();
console.log('Equipped gear! Held:', bot.inventory.selectedItem?.name, 'Inv:', JSON.stringify(lib.inv()));
console.log('Blaze rods currently carried:', lib.count('blaze_rod'));

bot.chat(`beta: In Spawner Pillbox! Carried Blaze rods: ${lib.count('blaze_rod')}`);

// --- Phase 4: Slay Blazes & Harvest 7+ Blaze Rods ---
let rounds = 0;
while (rounds < 100 && !isCancelled()) {
  rounds++;
  const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) <= 4.2);
  if (blaze) {
    const dist = bot.entity.position.distanceTo(blaze.position).toFixed(1);
    console.log(`[Round ${rounds}] Striking Blaze at dist ${dist}m...`);
    await lib.equipWeapon();
    await bot.lookAt(blaze.position.offset(0, 0.5, 0), true);
    bot.attack(blaze);
    await sleep(600);
  } else {
    // If shield equipped in offhand, hold shield active
    if (bot.inventory.slots[45]?.name === 'shield') {
      try { bot.activateItem(true); } catch (e) {}
    }
    await sleep(300);
  }

  if (rounds % 3 === 0) {
    const gained = await lib.pickup(6);
    if (gained > 0) {
      console.log('Drops scooped! Blaze rods:', lib.count('blaze_rod'), 'Inv:', JSON.stringify(lib.inv()));
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
