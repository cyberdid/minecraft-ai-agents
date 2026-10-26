// programs/559-gear-up-and-return-to-frontline.js
console.log('=== Program 559: Gear Up & Return to Frontline ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Step through the base door
try {
  console.log('Exiting base through door at (294, 72, -54)...');
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door exit note:', e.message);
  // Manual door fallback
  try {
    await lib.door(294, 72, -54, true);
    await bot.lookAt(new Vec3(296, 72, -54), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Outside base! Current pos:', lib.fmt(bot.entity.position));

// 2. Obtain stone pickaxe, stone sword, and 16 cobblestone
console.log('Obtaining stone pickaxe...');
await lib.obtain('stone_pickaxe', 1);
console.log('Crafting stone sword...');
await lib.obtain('stone_sword', 1);
console.log('Collecting 16 cobblestone...');
try {
  await lib.collect('cobblestone', 16);
} catch (e) {
  console.log('Collect cobble note:', e.message);
}

console.log('Geared up! Inventory:', lib.inv());

// 3. Walk into Nether portal at (299, 73, -54)
console.log('Entering Nether portal at (299, 73, -54)...');
await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
try {
  await lib.goTo(299, 73, -54, 1, { timeoutMs: 10000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// 4. Wait for dimension change
console.log('Waiting inside portal for Nether transit...');
const portalWaitStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - portalWaitStart < 15000) {
  await sleep(250);
}
console.log('Dimension now:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: Returned to Nether! Sprinting to Spawner Bridgehead to recover gear and breach spawner!');
  
  // Step out of Nether portal bunker
  await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
  
  // Safe waypoints along the 100% covered trail to Spawner Bridgehead
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
  
  // Pickup recovered gear at (44, 65, -174)
  console.log('Arrived at Spawner Bridgehead! Picking up gear...');
  try { await lib.pickup(10); } catch (e) {}
  await lib.equipWeapon();
  await lib.equipArmor();
  
  console.log('=== Recovery Complete ===');
  console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
  console.log('Inventory:', lib.inv());
  bot.chat(`alpha: United at Spawner Bridgehead ${lib.fmt(bot.entity.position)}! Inv: ${lib.count('cobblestone')} cobble, ${lib.count('stone_sword')} stone swords!`);
}
