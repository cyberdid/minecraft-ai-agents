// programs/578-advance-onto-balcony-deck-and-slay.js
console.log('=== Program 578: Advance onto Spawner Balcony Deck & Slay Blazes ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

await lib.equipWeapon();

// 1. Inspect blocks from current pos (37, 65, -185) to Spawner (32, 68, -190)
console.log('--- Inspecting Balcony Deck Approach ---');
for (let x = 36; x >= 32; x--) {
  for (let z = -185; z >= -190; z--) {
    for (let y = 65; y <= 68; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air' && b.name !== 'fire') {
        console.log(`(${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}

// 2. Safe step up to (35, 66, -186) then (34, 67, -187)
const targetDeck = new Vec3(34, 67, -187);
console.log(`Moving to target deck: ${lib.fmt(targetDeck)}...`);

// Helper to safely step with floor check
async function safeStep(target) {
  const fl = bot.blockAt(new Vec3(target.x, target.y - 1, target.z));
  console.log(`Checking step to ${lib.fmt(target)}: floor(y=${target.y - 1}) is ${fl?.name}`);
  if (!fl || fl.boundingBox !== 'block') {
    const mat = lib.count('cobblestone') > 0 ? 'cobblestone' : 'soul_sand';
    console.log(`Placing floor at (${target.x}, ${target.y - 1}, ${target.z}) with ${mat}...`);
    try {
      await lib.place(mat, target.x, target.y - 1, target.z);
    } catch (e) {
      console.log('Floor place note:', e.message);
    }
  }
  
  await bot.lookAt(new Vec3(target.x + 0.5, target.y + 0.5, target.z + 0.5), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('forward', false);
  bot.setControlState('jump', false);
  console.log(`Current pos: ${lib.fmt(bot.entity.position)}`);
}

// Approach steps
await safeStep(new Vec3(36, 66, -186));
await safeStep(new Vec3(35, 66, -186));
await safeStep(new Vec3(34, 67, -187));

console.log('Frontline position reached:', lib.fmt(bot.entity.position));
await lib.equipWeapon();

// Check hostiles around Spawner
const hostiles = lib.hostiles(16);
console.log(`Hostiles near spawner (${hostiles.length}):`, hostiles.map(h => `${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`));

// 3. Combat Loop: attack Blazes within 4.5m
const combatStart = Date.now();
let lastRods = lib.count('blaze_rod');

while (Date.now() - combatStart < 45000 && !isCancelled()) {
  await lib.equipWeapon();
  
  const blazes = Object.values(bot.entities).filter(e => 
    e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) < 5.0
  );
  
  if (blazes.length > 0) {
    blazes.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
    const target = blazes[0];
    const d = bot.entity.position.distanceTo(target.position);
    console.log(`Blaze in attack range (${d.toFixed(1)}m)! Striking with stone sword...`);
    
    await bot.lookAt(target.position.offset(0, 1.0, 0), true);
    bot.attack(target);
    await sleep(400);
    
    if (target.isValid) {
      await bot.lookAt(target.position.offset(0, 1.0, 0), true);
      bot.attack(target);
      await sleep(400);
    }
  }
  
  try { await lib.pickup(6); } catch (e) {}
  
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
  
  await sleep(400);
}

const finalRods = lib.count('blaze_rod');
console.log('=== Final Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Blaze rods harvested:', finalRods);
console.log('Inventory:', lib.inv());
bot.chat(`alpha: Balcony engagement round ended at ${lib.fmt(bot.entity.position)}! Rods: ${finalRods}, HP: ${bot.health.toFixed(1)}/20`);
