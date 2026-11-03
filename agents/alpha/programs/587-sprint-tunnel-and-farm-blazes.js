// programs/587-sprint-tunnel-and-farm-blazes.js
console.log('=== Program 587: Sprint Tunnel & Farm Blaze Rods on Spawner Balcony ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());

await lib.equipWeapon();
await lib.equipArmor();

// 1. Safe waypoints directly to Spawner Balcony deck
const trailWaypoints = [
  new Vec3(63, 65, -8),
  new Vec3(63, 65, -20),
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
  new Vec3(35, 67, -186)  // Spawner Balcony deck!
];

for (let i = 0; i < trailWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = trailWaypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  
  console.log(`Trail WP ${i + 1}/${trailWaypoints.length}: heading to ${lib.fmt(wp)}...`);
  // Look down at y=64 to avoid Enderman stare mechanics
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
  
  // Pickup any items along the path
  try { await lib.pickup(6); } catch (e) {}
}

console.log('Arrived at Spawner Balcony deck! Current pos:', lib.fmt(bot.entity.position));

// 2. Vacuum all dropped items on the balcony deck (Gamma and Alpha drops)
console.log('Vacuuming dropped gear on Spawner Balcony...');
try {
  const gained = await lib.pickup(10);
  console.log(`Gained ${gained} items from deck!`);
} catch (pe) {}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Gear equipped! Inventory:', lib.inv());

// 3. Combat Loop: Slay Blazes and Farm Blaze Rods
console.log('Starting Blaze combat loop...');
bot.chat(`alpha: On Spawner Balcony ${lib.fmt(bot.entity.position)}! Engaging Blazes for Milestone 8!`);

const spawnerPos = new Vec3(32, 68, -190);
const combatStart = Date.now();
let lastRods = lib.count('blaze_rod');

while (Date.now() - combatStart < 60000 && !isCancelled() && bot.health > 4) {
  await lib.equipWeapon();
  await lib.equipArmor();
  
  const hostiles = lib.hostiles(10);
  const blazes = hostiles.filter(h => h.name === 'blaze');
  console.log(`Blazes nearby (${blazes.length}):`, blazes.map(b => `${b.dist.toFixed(1)}m`));
  
  if (blazes.length > 0) {
    blazes.sort((a, b) => a.dist - b.dist);
    const target = blazes[0];
    const entity = Object.values(bot.entities).find(e => e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) < 5.5);
    
    if (entity) {
      console.log(`Striking Blaze at ${lib.fmt(entity.position)} (dist: ${bot.entity.position.distanceTo(entity.position).toFixed(1)}m)...`);
      await bot.lookAt(entity.position.offset(0, 1.0, 0), true);
      bot.attack(entity);
      await sleep(400); // 1.20 attack cooldown
      
      if (entity.isValid) {
        await bot.lookAt(entity.position.offset(0, 1.0, 0), true);
        bot.attack(entity);
        await sleep(400);
      }
    }
  }
  
  // Vacuum dropped Blaze Rods
  try {
    await lib.pickup(8);
  } catch (e) {}
  
  const currentRods = lib.count('blaze_rod');
  if (currentRods !== lastRods) {
    console.log(`+++ BLAZE ROD HARVESTED! Total: ${currentRods} +++`);
    bot.chat(`alpha: Blaze Rod harvested! Total rods: ${currentRods}/8!`);
    lastRods = currentRods;
  }
  
  if (currentRods >= 7) {
    console.log(`*** TARGET ACHIEVED: ${currentRods} Blaze Rods! ***`);
    bot.chat(`alpha: TARGET ACHIEVED! Harvested ${currentRods} Blaze Rods! Milestone 8 Complete!`);
    break;
  }
  
  await sleep(400);
}

const finalRods = lib.count('blaze_rod');
console.log('=== Final Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Blaze rods harvested:', finalRods);
console.log('Inventory:', lib.inv());
bot.chat(`alpha: Balcony assault round complete at ${lib.fmt(bot.entity.position)}! Rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
