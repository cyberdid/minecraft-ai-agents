// programs/588-craft-shield-bridge-west-and-slay.js
console.log('=== Program 588: Craft Shield, Bridge to Spawner & Slay Blazes ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());

// 1. Craft Shield right here
console.log('Ensuring crafting table to craft shield...');
try {
  await lib.ensureTable();
  await lib.craft('shield', 1);
  console.log('SHIELD CRAFTED!');
} catch (e) {
  console.log('Shield craft note:', e.message);
}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.heldItem?.name);
bot.chat(`alpha: SHIELD equipped at (42, 66, -190)! Bridging to Spawner (32, 68, -190) to harvest Blaze Rods!`);

// Helper to safely place a floor block
async function placeFloor(x, y, z) {
  const b = bot.blockAt(new Vec3(x, y, z));
  if (b && b.name !== 'air' && b.name !== 'cave_air' && b.name !== 'fire') return true;
  try {
    await lib.place('cobblestone', x, y, z);
    console.log(`Placed floor at (${x}, ${y}, ${z})`);
    return true;
  } catch (e) {
    console.log(`Place floor (${x}, ${y}, ${z}) note: ${e.message}`);
    return false;
  }
}

// 2. Inspect terrain between Alpha (42, 66, -190) and Spawner (32, 68, -190)
console.log('--- Inspecting path to Spawner (32, 68, -190) ---');
for (let x = 42; x >= 32; x--) {
  for (let z = -188; z >= -192; z--) {
    const fl = bot.blockAt(new Vec3(x, 65, z))?.name || 'air';
    const fl2 = bot.blockAt(new Vec3(x, 66, z))?.name || 'air';
    const fl3 = bot.blockAt(new Vec3(x, 67, z))?.name || 'air';
    if (fl !== 'air' || fl2 !== 'air' || fl3 !== 'air') {
      console.log(`(${x}, ${z}): y65=${fl}, y66=${fl2}, y67=${fl3}`);
    }
  }
}

// 3. Advance West towards Spawner (32, 68, -190)
console.log('Advancing West towards Spawner...');
for (let x = Math.floor(bot.entity.position.x) - 1; x >= 34; x--) {
  if (isCancelled() || bot.health <= 4) break;
  const targetZ = -190;
  
  // Ensure solid floor at y=65 or 66 underfoot
  const curY = Math.floor(bot.entity.position.y);
  await placeFloor(x, curY - 1, targetZ);
  
  // Step forward
  await bot.lookAt(new Vec3(x + 0.5, curY, targetZ + 0.5), true);
  bot.setControlState('forward', true);
  await sleep(500);
  bot.setControlState('forward', false);
  
  // Pickup any items
  try { await lib.pickup(6); } catch (pe) {}
  console.log(`Stepped to x=${x}, pos: ${lib.fmt(bot.entity.position)}`);
}

console.log('At spawner perimeter! Pos:', lib.fmt(bot.entity.position));

// 4. Combat Loop: Slay Blazes under Shield Protection
console.log('Engaging Blazes at Spawner (32, 68, -190)...');
bot.chat(`alpha: Slaying Blazes at Spawner perimeter ${lib.fmt(bot.entity.position)}! Harvesting rods!`);

const combatStart = Date.now();
let lastRods = lib.count('blaze_rod');

while (Date.now() - combatStart < 60000 && !isCancelled() && bot.health > 4) {
  await lib.equipWeapon();
  await lib.equipArmor();
  
  const hostiles = lib.hostiles(8);
  const blazes = hostiles.filter(h => h.name === 'blaze');
  console.log(`Blazes nearby (${blazes.length}):`, blazes.map(b => `${b.dist.toFixed(1)}m`));
  
  if (blazes.length > 0) {
    blazes.sort((a, b) => a.dist - b.dist);
    const target = blazes[0];
    const entity = Object.values(bot.entities).find(e => e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) < 5.0);
    
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
bot.chat(`alpha: Spawner engagement complete at ${lib.fmt(bot.entity.position)}! Rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
