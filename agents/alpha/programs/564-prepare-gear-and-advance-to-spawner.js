// programs/564-prepare-gear-and-advance-to-spawner.js
console.log('=== Program 564: Prepare Gear & Advance to Spawner ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// --- Stage 1: Exit Base & Gather Materials ---
console.log('Exiting base door at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.lookAt(new Vec3(296, 72, -54), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Outside base! Obtaining stone pickaxe...');
await lib.obtain('stone_pickaxe', 1);

console.log('Gathering 32 cobblestone at quarry...');
try {
  await lib.collect('cobblestone', 32);
} catch (e) {
  console.log('Collect cobble note:', e.message);
}

console.log('Crafting stone swords...');
try {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  await lib.craft('stone_sword', 2);
} catch (e) {
  console.log('Craft sword note:', e.message);
}

await lib.equipWeapon();
console.log('Ready for Nether assault! Inv:', lib.inv());
bot.chat(`alpha: Geared up with stone tools & ${lib.count('cobblestone')} cobble! Entering Nether portal!`);

// --- Stage 2: Enter Nether Portal ---
console.log('Entering Nether portal at (299, 73, -54)...');
try {
  await lib.goTo(299, 73, -54, 1, { timeoutMs: 8000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

console.log('Awaiting Nether dimension change...');
const portalStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 15000) {
  await sleep(250);
}

console.log('Dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// --- Stage 3: Sprint East Ridge Trail to Spawner Bridgehead ---
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Sprinting verified East Ridge trail to Spawner Bridgehead!');
  
  // Step out of Nether portal bunker
  await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
  
  const trailWaypoints = [
    new Vec3(63, 65, -8),
    new Vec3(63, 65, -20),
    new Vec3(63, 66, -35),
    new Vec3(62, 67, -50),
    new Vec3(61, 67, -65),
    new Vec3(62, 67, -80),
    new Vec3(61, 66, -100),
    new Vec3(50, 65, -115),
    new Vec3(44, 65, -127),
    new Vec3(44, 65, -148),
    new Vec3(44, 65, -163),
    new Vec3(44, 65, -174)
  ];
  
  for (let i = 0; i < trailWaypoints.length; i++) {
    if (isCancelled()) break;
    const wp = trailWaypoints[i];
    if (bot.entity.position.distanceTo(wp) < 2.5) continue;
    
    console.log(`Trail WP ${i + 1}/${trailWaypoints.length}: ${lib.fmt(wp)}...`);
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 10000 });
    } catch (err) {
      await bot.lookAt(new Vec3(wp.x + 0.5, wp.y, wp.z + 0.5), true);
      bot.setControlState('forward', true);
      bot.setControlState('sprint', true);
      await sleep(1200);
      bot.setControlState('forward', false);
      bot.setControlState('sprint', false);
    }
  }
  
  console.log('Arrived at Spawner Bridgehead (44, 65, -174)! Picking up drops...');
  try { await lib.pickup(10); } catch (e) {}
  await lib.equipWeapon();
  
  // --- Stage 4: Cross Protected Bridge to (37, 65, -177) ---
  console.log('Crossing Delta blast-walled bridge to (37, 65, -177)...');
  const bridgeWalk = [
    new Vec3(44, 65, -176),
    new Vec3(42, 65, -176),
    new Vec3(40, 65, -176),
    new Vec3(38, 65, -177),
    new Vec3(37, 65, -177)
  ];
  
  for (const bp of bridgeWalk) {
    if (isCancelled()) break;
    const fl = bot.blockAt(bp.offset(0, -1, 0));
    if (fl && fl.boundingBox === 'block') {
      await bot.lookAt(new Vec3(bp.x + 0.5, bp.y, bp.z + 0.5), true);
      bot.setControlState('forward', true);
      await sleep(600);
      bot.setControlState('forward', false);
    } else {
      console.log(`Bridge floor at ${lib.fmt(bp)} is missing (${fl?.name}), bridging...`);
      try {
        await lib.place('cobblestone', bp.x, bp.y - 1, bp.z);
      } catch (pe) {}
    }
  }
  
  try { await lib.pickup(8); } catch (e) {}
  console.log('Frontline position reached:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
  console.log('Inventory:', lib.inv());
  
  const distSpawner = bot.entity.position.distanceTo(new Vec3(32, 68, -190));
  console.log(`Distance to Blaze Spawner: ${distSpawner.toFixed(1)}m`);
  bot.chat(`alpha: At Spawner Frontline ${lib.fmt(bot.entity.position)}! Spawner dist: ${distSpawner.toFixed(1)}m. Remaining cobble: ${lib.count('cobblestone')}`);
}
