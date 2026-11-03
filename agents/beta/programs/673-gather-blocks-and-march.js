// programs/673-gather-blocks-and-march.js
console.log('=== Program 673: Quick Blocks & March to Recover Gear ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Step 1: Dig 8 netherrack blocks nearby for emergency building
console.log('Step 1: Gathering 8 netherrack blocks...');
const nrBlocks = bot.findBlocks({
  matching: mcData.blocksByName.netherrack.id,
  maxDistance: 4.5
});

let dug = 0;
for (const p of nrBlocks) {
  if (dug >= 8) break;
  // Don't dig floor under feet
  if (p.x === Math.floor(bot.entity.position.x) && p.z === Math.floor(bot.entity.position.z)) continue;
  try {
    const b = bot.blockAt(p);
    if (b) {
      await bot.dig(b);
      dug++;
      await sleep(100);
    }
  } catch (e) {}
}
await lib.pickup(4);
console.log('Netherrack gathered:', lib.count('netherrack'));

bot.chat('beta: Marching to recover Gamma gear at (44, 65, -169) and reinforce Spawner!');

// Configure movement with fire and lava avoidance
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowSprinting = true;
bot.pathfinder.setMovements(moves);

// Step 2: Waypoints to Fortress Workshop and Gamma recovery spot
const waypoints = [
  new Vec3(46, 65, -8),
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
  new Vec3(44, 65, -169)  // Gamma drop recovery spot
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i+1}/${waypoints.length}] Navigating to ${wp}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
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

console.log('AT RECOVERY POINT (44, 65, -169)! Pos:', lib.fmt(bot.entity.position));

// Vacuum all dropped gear from Gamma
console.log('Vacuuming dropped items...');
await lib.pickup(12);
console.log('Inventory after pickup:', JSON.stringify(lib.inv()));

// Equip best armor and weapon
await lib.equipArmor();
await lib.equipWeapon();
if (bot.food < 18) {
  try { await lib.eat(); } catch (e) {}
}

console.log('Equipped gear! Held:', bot.inventory.selectedItem?.name, 'Armor:', bot.inventory.slots[6]?.name);

// Step 3: Advance to Spawner Pillbox at (34, 68, -188)
const pillboxWaypoints = [
  new Vec3(44, 65, -176),
  new Vec3(38, 65, -176),
  new Vec3(38, 65, -178),
  new Vec3(37, 65, -184),
  new Vec3(35, 67, -186),
  new Vec3(34, 68, -188)
];

for (let i = 0; i < pillboxWaypoints.length && !isCancelled(); i++) {
  const wp = pillboxWaypoints[i];
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    const d = bot.entity.position.distanceTo(wp);
    if (d < 5) {
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
await lib.pickup(10);
await lib.equipArmor();
await lib.equipWeapon();

bot.chat(`beta: In Spawner Pillbox with Alpha! Blaze rods carried: ${lib.count('blaze_rod')}`);

// Combat: Slay Blazes within reach
let rounds = 0;
while (rounds < 80 && !isCancelled()) {
  rounds++;
  const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) <= 4.2);
  if (blaze) {
    console.log(`[Round ${rounds}] Striking Blaze at dist ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m...`);
    await lib.equipWeapon();
    await bot.lookAt(blaze.position.offset(0, 0.5, 0), true);
    bot.attack(blaze);
    await sleep(600);
  } else {
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
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
