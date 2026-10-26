// programs/565-ascend-mine-craft-swords-enter-nether.js
console.log('=== Program 565: Ascend Mine, Craft Swords, Enter Nether & Breach Spawner ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', lib.inv());

// --- Stage 1: Staged Ascent up Mine Shaft to Surface ---
console.log('Ascending mine shaft to surface...');
const mineAscent = [
  new Vec3(299, 53, -58),
  new Vec3(302, 60, -50),
  new Vec3(302, 66, -46),
  new Vec3(302, 71, -44), // Mine shaft mouth at surface
  new Vec3(295, 72, -54), // Base door
  new Vec3(292, 72, -59)  // Crafting table area
];

for (let i = 0; i < mineAscent.length; i++) {
  const p = mineAscent[i];
  console.log(`Ascent step ${i + 1}/${mineAscent.length}: heading to ${lib.fmt(p)}...`);
  try {
    await lib.goTo(p.x, p.y, p.z, 1.5, { timeoutMs: 8000 });
  } catch (e) {
    console.log(`Step ${i + 1} note: ${e.message}. Using direct movement...`);
    await bot.lookAt(new Vec3(p.x + 0.5, p.y, p.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(1200);
    bot.setControlState('forward', false);
    bot.setControlState('jump', false);
  }
}

console.log('At base crafting area! Current pos:', lib.fmt(bot.entity.position));

// --- Stage 2: Craft Stone Swords ---
console.log('Crafting stone swords...');
try {
  await lib.craft('stone_sword', 2);
  console.log('Crafted stone swords!');
} catch (e) {
  console.log('Craft stone sword note:', e.message);
}

await lib.equipWeapon();
console.log('Geared up! Inventory:', lib.inv());

// --- Stage 3: Enter Nether Portal ---
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

// --- Stage 4: Sprint Nether Trail to Spawner Balcony ---
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether with stone swords & 38 cobble! Advancing to Spawner Balcony!');
  
  // Step out of Nether portal bunker
  await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
  
  const netherTrail = [
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
    new Vec3(34, 67, -187)  // Delta's Spawner Balcony connection!
  ];
  
  for (let i = 0; i < netherTrail.length; i++) {
    if (isCancelled()) break;
    const wp = netherTrail[i];
    if (bot.entity.position.distanceTo(wp) < 2.5) continue;
    
    console.log(`Trail WP ${i + 1}/${netherTrail.length}: ${lib.fmt(wp)}...`);
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
  
  console.log('Arrived at Spawner Balcony frontline! Pos:', lib.fmt(bot.entity.position));
  try { await lib.pickup(10); } catch (e) {}
  await lib.equipWeapon();
  
  // Check for Blazes and Spawner
  const hostiles = lib.hostiles(16);
  console.log(`Hostiles near spawner (${hostiles.length}):`, hostiles.map(h => `${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`));
  
  // Fight any Blaze within 4m
  const blazes = hostiles.filter(h => h.name === 'blaze' && h.dist < 4.5);
  for (const bz of blazes) {
    if (isCancelled()) break;
    console.log(`Striking Blaze at ${lib.fmt(bz.pos)}...`);
    try {
      await lib.fight(bz.name);
      await lib.pickup(6);
    } catch (fe) {
      console.log('Fight note:', fe.message);
    }
  }
  
  const blazeRods = lib.count('blaze_rod');
  console.log('Blaze rods harvested:', blazeRods);
  bot.chat(`alpha: Slaying Blazes at Spawner Balcony ${lib.fmt(bot.entity.position)}! Blaze rods: ${blazeRods}`);
}
