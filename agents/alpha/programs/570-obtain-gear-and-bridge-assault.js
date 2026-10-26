// programs/570-obtain-gear-and-bridge-assault.js
console.log('=== Program 570: Obtain Gear & Spawner Assault ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// --- 1. Exit Base & Obtain Gear ---
console.log('Exiting base door...');
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

console.log('Obtaining stone pickaxe...');
await lib.obtain('stone_pickaxe', 1);

console.log('Gathering 24 cobblestone at surface quarry...');
try {
  await lib.collect('cobblestone', 24);
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
console.log('Geared up! Inventory:', lib.inv());
bot.chat(`alpha: Armed with stone tools & ${lib.count('cobblestone')} cobble! Entering Nether portal!`);

// --- 2. Enter Nether Portal ---
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

// --- 3. Sprint Nether Trail to Spawner Balcony ---
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Sprinting verified East Ridge trail to Spawner Balcony!');
  
  // Step forward out of portal bunker
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
    new Vec3(44, 65, -174), // Spawner Bridgehead
    new Vec3(37, 65, -177), // Cross-bridge end
    new Vec3(34, 67, -187)  // Delta's Spawner Balcony deck connection!
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
  
  console.log('Arrived at Spawner Balcony! Pos:', lib.fmt(bot.entity.position));
  try { await lib.pickup(8); } catch (e) {}
  await lib.equipWeapon();
  
  // Check for hostiles & Blazes
  const hostiles = lib.hostiles(16);
  console.log(`Hostiles near spawner (${hostiles.length}):`, hostiles.map(h => `${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`));
  
  // Slay Blazes
  for (const h of hostiles) {
    if (isCancelled()) break;
    if (h.name === 'blaze' && h.dist < 5.0) {
      console.log(`Striking Blaze at ${lib.fmt(h.pos)}...`);
      try {
        await lib.fight('blaze');
        await lib.pickup(6);
      } catch (fe) {}
    }
  }
  
  const rods = lib.count('blaze_rod');
  console.log('Blaze rods harvested:', rods);
  bot.chat(`alpha: Slaying Blazes on Spawner Balcony ${lib.fmt(bot.entity.position)}! Blaze rods: ${rods}`);
}
