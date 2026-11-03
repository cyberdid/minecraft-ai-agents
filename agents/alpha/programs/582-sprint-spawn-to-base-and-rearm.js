// programs/582-sprint-spawn-to-base-and-rearm.js
console.log('=== Program 582: Sprint Spawn to Base, Lock Spawn & Rearm ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Sprint East from world spawn to base camp at (294, 72, -54)
console.log('Sprinting across Overworld to base camp...');
const overlandWaypoints = [
  new Vec3(110, 62, -100),
  new Vec3(150, 64, -50),
  new Vec3(200, 64, -40),
  new Vec3(250, 63, -50),
  new Vec3(290, 72, -54),
  new Vec3(294, 72, -54)
];

for (let i = 0; i < overlandWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = overlandWaypoints[i];
  if (bot.entity.position.distanceTo(wp) < 4.0) continue;
  
  console.log(`Overland step ${i + 1}/${overlandWaypoints.length}: heading to ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 3, { timeoutMs: 12000 });
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(2000);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
    bot.setControlState('jump', false);
  }
}

console.log('Arrived at base exterior! Current pos:', lib.fmt(bot.entity.position));

// 2. Enter base through door at (294, 72, -54)
console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.lookAt(new Vec3(293, 72, -55), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Ensure door is closed
try { await lib.door(294, 72, -54, false); } catch (e) {}

// 3. Lock spawn on bed permanently
console.log('Locking spawn on base bed...');
try {
  await lib.setSpawn();
  console.log('Spawn locked at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

bot.chat(`alpha: Safely inside base camp ${lib.fmt(bot.entity.position)}! Spawn locked! Rearming for Nether assault!`);

// 4. Obtain shield, stone pickaxe, stone sword
console.log('Obtaining shield via lib.obtain...');
try {
  await lib.obtain('shield', 1);
} catch (e) {
  console.log('Shield obtain note:', e.message);
}

if (lib.count('*sword') === 0) {
  try { await lib.obtain('stone_sword', 1); } catch (e) {}
}
if (lib.count('*pickaxe') === 0) {
  try { await lib.obtain('stone_pickaxe', 1); } catch (e) {}
}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Armed! Inventory:', lib.inv());

// 5. Walk into Nether portal at (299.5, 73.0, -54.0)
console.log('Walking to Nether portal...');
try {
  await lib.goTo(299, 73, -54, 0.5, { timeoutMs: 10000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// Await Nether dimension change
console.log('Awaiting Nether dimension change...');
const portalStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 20000) {
  await sleep(250);
}

console.log('Dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 6. Sprint to Spawner Balcony
if (bot.game.dimension === 'the_nether') {
  bot.chat('alpha: In Nether with shield! Sprinting to Spawner Balcony deck!');
  
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
    new Vec3(44, 65, -127), // Fortress Workshop Outpost
    new Vec3(44, 65, -148),
    new Vec3(44, 65, -163),
    new Vec3(44, 65, -174), // Spawner Bridgehead
    new Vec3(37, 65, -177), // Cross-bridge end
    new Vec3(34, 67, -187)  // Spawner Balcony connection!
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
  try { await lib.pickup(10); } catch (e) {}
  await lib.equipArmor();
  await lib.equipWeapon();
  
  // Fight Blazes
  for (let pass = 0; pass < 15; pass++) {
    if (isCancelled() || bot.health <= 6) break;
    await lib.equipWeapon();
    await lib.equipArmor();
    
    const hostiles = lib.hostiles(8);
    const blazes = hostiles.filter(h => h.name === 'blaze');
    if (blazes.length > 0) {
      const entity = Object.values(bot.entities).find(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 5.0);
      if (entity) {
        console.log(`Striking Blaze at ${lib.fmt(entity.position)}...`);
        await bot.lookAt(entity.position.offset(0, 1.0, 0), true);
        bot.attack(entity);
        await sleep(400);
        if (entity.isValid) {
          bot.attack(entity);
          await sleep(400);
        }
      }
    }
    
    try { await lib.pickup(8); } catch (e) {}
    const rods = lib.count('blaze_rod');
    if (rods >= 7) {
      bot.chat(`alpha: TARGET ACHIEVED! Harvested ${rods} Blaze Rods! Milestone 8 Complete!`);
      break;
    }
    await sleep(400);
  }
  
  const finalRods = lib.count('blaze_rod');
  console.log('Final Blaze Rods:', finalRods);
  bot.chat(`alpha: Balcony assault complete at ${lib.fmt(bot.entity.position)}! Rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
}
