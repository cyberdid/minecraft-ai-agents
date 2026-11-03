// programs/573-craft-at-hillside-and-enter-nether.js
console.log('=== Program 573: Gather Tools at Hillside Quarry & Enter Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Gather 2 logs from birch tree at (314, 76, -46)
console.log('Gathering logs at hillside...');
try {
  await lib.collect('*_log', 2);
} catch (e) {
  console.log('Collect log note:', e.message);
}

// 2. Craft planks, sticks, crafting table, wooden pickaxe
console.log('Crafting wooden tools...');
try {
  await lib.craft('*_planks', 8);
  await lib.craft('stick', 4);
  await lib.craft('crafting_table', 1);
  await lib.craft('wooden_pickaxe', 1);
} catch (e) {
  console.log('Craft wooden tools note:', e.message);
}

// 3. Mine 24 cobblestone at hillside quarry (x=314, z=-60)
console.log('Mining stone at hillside quarry...');
try {
  await lib.collect('cobblestone', 3);
  await lib.craft('stone_pickaxe', 1);
  await lib.collect('cobblestone', 20);
  await lib.craft('stone_sword', 2);
} catch (e) {
  console.log('Stone tool/cobble note:', e.message);
}

await lib.equipWeapon();
console.log('Geared up! Inventory:', lib.inv());
bot.chat(`alpha: Armed with stone tools & ${lib.count('cobblestone')} cobble! Heading into Nether portal!`);

// 4. Enter Nether portal - STAND EXACTLY INSIDE PORTAL at (299.5, 73.0, -54.0)
console.log('Walking directly inside Nether portal block at (299.5, 73.0, -54.0)...');
await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
try {
  await lib.goTo(299, 73, -54, 0.5, { timeoutMs: 8000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// Await dimension change
console.log('Inside portal, awaiting dimension change...');
const portalStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 20000) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 5. In Nether: Sprint the verified safe trail to Spawner Balcony
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether! Sprinting safe corridor to Spawner Balcony!');
  
  // Exit portal bunker towards x=44
  await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
  
  const safeTrail = [
    new Vec3(46, 65, -7),
    new Vec3(54, 65, -7),
    new Vec3(63, 64, -7),  // Excavated tunnel entrance at y=64
    new Vec3(63, 65, -20), // Inside tunnel
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
    new Vec3(34, 67, -187)  // Delta's Spawner Balcony connection!
  ];
  
  for (let i = 0; i < safeTrail.length; i++) {
    if (isCancelled()) break;
    const wp = safeTrail[i];
    if (bot.entity.position.distanceTo(wp) < 2.5) continue;
    
    console.log(`Trail WP ${i + 1}/${safeTrail.length}: ${lib.fmt(wp)}...`);
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
  
  // Fight Blazes
  const hostiles = lib.hostiles(16);
  console.log(`Hostiles near spawner (${hostiles.length}):`, hostiles.map(h => `${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`));
  
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
