// programs/561-craft-swords-and-enter-nether.js
console.log('=== Program 561: Craft Swords & Enter Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());

// 1. Walk up mine stairs to base
console.log('Walking up mine stairs to base...');
const mineStairs = [
  new Vec3(304, 63, -44),
  new Vec3(302, 71, -44),
  new Vec3(295, 72, -54),
  new Vec3(292, 72, -59) // Near crafting table at (291, 72, -60)
];

for (const p of mineStairs) {
  try {
    await lib.goTo(p.x, p.y, p.z, 1.5, { timeoutMs: 8000 });
  } catch (e) {
    await bot.lookAt(new Vec3(p.x + 0.5, p.y, p.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(1000);
    bot.setControlState('forward', false);
    bot.setControlState('jump', false);
  }
}

console.log('At base crafting area! Pos:', lib.fmt(bot.entity.position));

// 2. Craft sticks and stone swords
if (lib.count('stick') < 2) {
  console.log('Crafting sticks...');
  try {
    await lib.craft('stick', 4);
  } catch (e) {
    console.log('Craft stick note:', e.message);
  }
}

console.log('Crafting stone swords...');
try {
  await lib.craft('stone_sword', 2);
} catch (e) {
  console.log('Craft stone sword note:', e.message);
}

await lib.equipWeapon();
console.log('Ready to enter Nether! Inv:', lib.inv());

// 3. Walk to Nether portal at (299, 73, -54)
console.log('Walking to Nether portal...');
try {
  await lib.goTo(299, 73, -54, 1, { timeoutMs: 8000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// 4. Wait for Nether dimension transit
console.log('Entering portal, awaiting dimension change...');
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - start < 15000) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 5. If in Nether, sprint through safe waypoints to Spawner Bridgehead
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether with stone swords & cobble! Sprinting to Spawner Bridgehead!');
  
  // Step forward out of portal bunker
  await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
  
  const netherWaypoints = [
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
  
  for (let i = 0; i < netherWaypoints.length; i++) {
    if (isCancelled()) break;
    const wp = netherWaypoints[i];
    if (bot.entity.position.distanceTo(wp) < 2.5) continue;
    
    console.log(`Advancing to Nether WP ${i + 1}/${netherWaypoints.length}: ${lib.fmt(wp)}...`);
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
  console.log('At Spawner Bridgehead! Picking up items...');
  try { await lib.pickup(10); } catch (e) {}
  await lib.equipWeapon();
  
  console.log('Alpha frontline pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
  console.log('Final inv:', lib.inv());
  bot.chat(`alpha: United at Spawner Bridgehead ${lib.fmt(bot.entity.position)} with stone swords & ${lib.count('cobblestone')} cobble!`);
}
