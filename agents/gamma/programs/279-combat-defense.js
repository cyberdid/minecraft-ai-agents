// programs/279-combat-defense.js
console.log('=== EMERGENCY COMBAT & DEFENSE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Locate all hostiles within 20m
const hostiles = lib.hostiles(20);
console.log(`Hostiles within 20m (${hostiles.length}):`);
for (const h of hostiles) {
  console.log(`  - ${h.name} at ${lib.fmt(h.pos)} (dist: ${h.dist.toFixed(1)}m, dy: ${(h.pos.y - bot.entity.position.y).toFixed(1)}m)`);
}

// 2. Equip stone sword
await lib.equipWeapon();

// 3. If any hostile is within melee range (< 4.5m), face and strike
const meleeTarget = bot.nearestEntity(e => 
  (e.name === 'blaze' || e.name === 'wither_skeleton' || e.name === 'skeleton') &&
  e.position.distanceTo(bot.entity.position) < 4.5
);

if (meleeTarget) {
  console.log(`CRITICAL: Melee target ${meleeTarget.name} at ${lib.fmt(meleeTarget.position)}! Attacking...`);
  await bot.lookAt(meleeTarget.position.offset(0, meleeTarget.height * 0.8, 0));
  for (let i = 0; i < 6 && meleeTarget.isValid; i++) {
    bot.attack(meleeTarget);
    await sleep(650);
  }
  try { await lib.pickup(4); } catch (e) {}
}

// 4. If Blaze is shooting from below / East, step back into covered corridor at (44, 65, -165)
if (bot.health < 15) {
  console.log('HP under 15! Retreating 8m south into covered tunnel at (44, 65, -165) for full cover...');
  try {
    await lib.goTo(44, 65, -165, 1, { timeoutMs: 5000 });
  } catch (e) {
    try { await lib.walkTo(44.5, -165.0, 3000); } catch (e2) {}
  }
}

// 5. Scan surroundings at retreat position
console.log('\nPosition after maneuver:', lib.fmt(bot.entity.position), 'HP:', bot.health);
const remainingHostiles = lib.hostiles(16);
console.log(`Remaining hostiles within 16m (${remainingHostiles.length}):`, remainingHostiles.map(h => `${h.name} at dist ${h.dist.toFixed(1)}m`));

bot.chat(`gamma status: HP ${bot.health}/20, pos ${lib.fmt(bot.entity.position)}, hostiles: ${remainingHostiles.length}`);
