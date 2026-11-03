// programs/362-spawner-bunker-and-farm-blazes.js
console.log('=== BLAZE SPAWNER BATTLE & ROD HARVEST ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check nearby teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'gamma') {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} dist ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
  }
}

// 2. Fortify / check pillbox wall
// Ensure solid floor underfoot at (35, 65, -187) and front wall towards (32, 68, -190)
const wallSpots = [
  new Vec3(35, 66, -188),
  new Vec3(34, 66, -188),
  new Vec3(34, 67, -188)
];

for (const wp of wallSpots) {
  const b = bot.blockAt(wp);
  if (!b || b.name === 'air') {
    if (lib.count('cobblestone') > 0) {
      console.log(`Placing defensive cobblestone at ${lib.fmt(wp)}...`);
      try {
        await lib.place('cobblestone', wp.x, wp.y, wp.z);
      } catch (e) {
        console.log(`Place wall at ${lib.fmt(wp)} note:`, e.message);
      }
    }
  }
}

// 3. Equip stone sword
await lib.equipWeapon();

// 4. Combat loop against Blazes
const combatStart = Date.now();
let initialRods = lib.count('blaze_rod');

while (Date.now() - combatStart < 45000 && !isCancelled()) {
  // If health dropped, eat cooked food
  if (bot.health <= 12) {
    console.log('Health at', bot.health, '- eating cooked food to heal...');
    try { await lib.eat(); } catch (e) {}
  }

  // Find nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e && e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 6)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  if (blazes.length > 0) {
    const target = blazes[0];
    const dist = target.position.distanceTo(bot.entity.position);
    console.log(`Engaging Blaze at ${lib.fmt(target.position)} (dist: ${dist.toFixed(1)}m)...`);

    await bot.lookAt(target.position.offset(0, target.height * 0.5, 0));
    bot.attack(target);
    await sleep(600);

    // If target was defeated or nearby drops exist, pick up!
    await lib.pickup(5);
  } else {
    // Check if drops are on the ground
    await lib.pickup(5);
    await sleep(800);
  }

  const currentRods = lib.count('blaze_rod');
  if (currentRods > initialRods) {
    console.log(`*** BLAZE ROD HARVESTED! Total: ${currentRods} ***`);
    bot.chat(`gamma: harvested Blaze Rod! Total: ${currentRods}`);
    initialRods = currentRods;
  }
}

console.log('Combat round finished. Blaze rods:', lib.count('blaze_rod'), 'HP:', bot.health);
console.log('Ending status:', JSON.stringify(lib.status()));
