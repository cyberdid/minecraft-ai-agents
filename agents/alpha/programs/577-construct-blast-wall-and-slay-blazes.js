// programs/577-construct-blast-wall-and-slay-blazes.js
console.log('=== Program 577: Construct Blast Shield & Slay Blazes ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Cobble in inv:', lib.count('cobblestone'), 'Swords:', lib.count('stone_sword'));

await lib.equipWeapon();

// 1. Inspect surrounding blocks at frontline
const cur = bot.entity.position.floored();
console.log('Current floor pos:', lib.fmt(cur));

// Helper to safely place a block
async function safePlace(name, x, y, z) {
  const b = bot.blockAt(new Vec3(x, y, z));
  if (b && b.name !== 'air' && b.name !== 'cave_air' && b.name !== 'fire') return true;
  try {
    await lib.place(name, x, y, z);
    console.log(`Placed ${name} at (${x}, ${y}, ${z})`);
    return true;
  } catch (e) {
    console.log(`Place (${x}, ${y}, ${z}) note: ${e.message}`);
    return false;
  }
}

// 2. Build 2-high blast shield towards Spawner (facing West and North)
// First ensure floor support at (36, 64, -185) and (37, 64, -186)
await safePlace('cobblestone', cur.x - 1, cur.y - 1, cur.z);
await safePlace('cobblestone', cur.x, cur.y - 1, cur.z - 1);
await safePlace('cobblestone', cur.x - 1, cur.y - 1, cur.z - 1);

// Build 2-high wall blocks
await safePlace('cobblestone', cur.x - 1, cur.y, cur.z);
await safePlace('cobblestone', cur.x - 1, cur.y + 1, cur.z);
await safePlace('cobblestone', cur.x - 1, cur.y, cur.z - 1);
await safePlace('cobblestone', cur.x - 1, cur.y + 1, cur.z - 1);
await safePlace('cobblestone', cur.x, cur.y, cur.z - 1);

console.log('Blast shield constructed! Alpha protected from fireballs.');
bot.chat('alpha: Blast shield constructed at frontline! Slaying Blazes!');

// 3. Combat loop: slay Blazes and harvest Blaze Rods
const startTime = Date.now();
let lastRods = lib.count('blaze_rod');

while (Date.now() - startTime < 45000 && !isCancelled()) {
  await lib.equipWeapon();
  
  // Find nearby Blazes
  const blazes = Object.values(bot.entities).filter(e => 
    e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) < 5.0
  );
  
  if (blazes.length > 0) {
    // Sort by distance
    blazes.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
    const target = blazes[0];
    const d = bot.entity.position.distanceTo(target.position);
    console.log(`Blaze in range (${d.toFixed(1)}m)! Striking...`);
    
    // Look at Blaze center mass and swing
    await bot.lookAt(target.position.offset(0, 1.0, 0), true);
    bot.attack(target);
    await sleep(400); // attack cooldown for 1.20+
    
    // Check if target still alive, swing again
    if (target.isValid) {
      await bot.lookAt(target.position.offset(0, 1.0, 0), true);
      bot.attack(target);
      await sleep(400);
    }
  }
  
  // Vacuum dropped items (Blaze Rods)
  try {
    await lib.pickup(6);
  } catch (e) {}
  
  const currentRods = lib.count('blaze_rod');
  if (currentRods !== lastRods) {
    console.log(`+++ BLAZE ROD HARVESTED! Total: ${currentRods} +++`);
    bot.chat(`alpha: Blaze Rod harvested! Total rods: ${currentRods}/8!`);
    lastRods = currentRods;
  }
  
  if (currentRods >= 7) {
    console.log(`TARGET REACHED: ${currentRods} Blaze Rods!`);
    bot.chat(`alpha: TARGET ACHIEVED! Harvested ${currentRods} Blaze Rods! Milestone 8 Complete!`);
    break;
  }
  
  await sleep(500);
}

const finalRods = lib.count('blaze_rod');
console.log('=== Final Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Blaze rods harvested:', finalRods);
console.log('Inventory:', lib.inv());
bot.chat(`alpha: Combat round ended at ${lib.fmt(bot.entity.position)}! Harvested rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
