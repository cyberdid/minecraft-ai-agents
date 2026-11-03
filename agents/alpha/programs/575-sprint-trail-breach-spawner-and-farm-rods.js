// programs/575-sprint-trail-breach-spawner-and-farm-rods.js
console.log('=== Program 575: Sprint Trail, Breach Spawner & Farm Blaze Rods ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', lib.inv());

await lib.equipWeapon();

// 1. Sprint along the verified safe trail to Spawner Balcony
const spawnerRoute = [
  new Vec3(54, 65, -7),
  new Vec3(63, 64, -7),  // Excavated tunnel entrance at y=64
  new Vec3(63, 65, -20), // Inside excavated tunnel
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
  new Vec3(37, 65, -177), // Cross-bridge (North wall protected by Delta)
  new Vec3(34, 67, -187)  // Spawner Balcony deck connection!
];

for (let i = 0; i < spawnerRoute.length; i++) {
  if (isCancelled()) break;
  const wp = spawnerRoute[i];
  const dist = bot.entity.position.distanceTo(wp);
  if (dist < 2.5) {
    console.log(`Already at WP ${i + 1} (${lib.fmt(wp)})`);
    continue;
  }
  
  console.log(`Advancing WP ${i + 1}/${spawnerRoute.length}: ${lib.fmt(wp)} (dist: ${dist.toFixed(1)}m)...`);
  // Look down at y=64 to never aggro Endermen
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 10000 });
  } catch (err) {
    console.log(`WP ${i + 1} note: ${err.message}. Direct movement fallback...`);
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1200);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
  
  // Pick up any drops along the way
  const nearbyItems = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 6);
  if (nearbyItems.length > 0) {
    try { await lib.pickup(6); } catch (e) {}
  }
}

console.log('Arrived at Spawner Balcony! Position:', lib.fmt(bot.entity.position));
await lib.equipWeapon();
bot.chat(`alpha: Breached Spawner Balcony ${lib.fmt(bot.entity.position)}! Slaying Blazes!`);

// 2. Locate Blaze Spawner and Blazes
const spawnerPos = new Vec3(32, 68, -190);
console.log(`Distance to Spawner (32, 68, -190): ${bot.entity.position.distanceTo(spawnerPos).toFixed(1)}m`);

// Farm Blazes in a combat loop for up to 60s
const combatStart = Date.now();
while (Date.now() - combatStart < 60000 && !isCancelled()) {
  const hostiles = lib.hostiles(16);
  const blazes = hostiles.filter(h => h.name === 'blaze');
  console.log(`Active Blazes nearby: ${blazes.length}`);
  
  if (blazes.length > 0) {
    // Attack closest Blaze
    const target = blazes[0];
    console.log(`Attacking Blaze at ${lib.fmt(target.pos)} (dist: ${target.dist.toFixed(1)}m)...`);
    try {
      await lib.fight('blaze');
    } catch (fe) {
      console.log('Fight note:', fe.message);
      // Fallback: direct attack
      const entity = Object.values(bot.entities).find(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 4.5);
      if (entity) {
        await bot.lookAt(entity.position.offset(0, 1.0, 0), true);
        bot.attack(entity);
      }
    }
  }
  
  // Vacuum dropped items
  try {
    await lib.pickup(8);
  } catch (e) {}
  
  const rods = lib.count('blaze_rod');
  console.log(`Current Blaze Rods in inv: ${rods}`);
  if (rods >= 6) {
    console.log(`TARGET REACHED! Harvested ${rods} Blaze Rods!`);
    bot.chat(`alpha: TARGET REACHED! Harvested ${rods} Blaze Rods on Spawner Balcony! Milestone 8 Achieved!`);
    break;
  }
  
  await sleep(1000);
}

const finalRods = lib.count('blaze_rod');
console.log('=== Final Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Blaze rods:', finalRods);
console.log('Inventory:', lib.inv());
bot.chat(`alpha: Spawner engagement round complete at ${lib.fmt(bot.entity.position)}! Blaze rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
