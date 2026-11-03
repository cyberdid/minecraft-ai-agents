console.log('=== PROGRAM 694: DELTA PILLBOX COMBAT COOP ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Equip golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}
try { await lib.equipWeapon(); } catch (e) {}

// Raise shield by default
bot.activateItem(true);
console.log('Active shield raised facing Spawner at (32, 68, -190)');

let lastAttack = 0;
let hits = 0;
let kills = 0;
let lastRods = lib.count('blaze_rod');
const startTime = Date.now();
const COMBAT_MS = 90000;

console.log(`Starting Blaze Rods: ${lastRods}/8. Entering combat loop for ${COMBAT_MS/1000}s...`);
bot.chat(`delta: Fighting Blazes at Pillbox alongside Gamma! Initial rods: ${lastRods}/8.`);

while (Date.now() - startTime < COMBAT_MS && !checkCancelled()) {
  // Low health defense
  if (bot.health <= 7) {
    bot.activateItem(true);
    await sleep(500);
    continue;
  }

  // Ensure shield raised
  if (bot.inventory.slots[45]?.name !== 'shield') {
    const sh = bot.inventory.items().find(i => i.name === 'shield');
    if (sh) await bot.equip(sh, 'off-hand');
  }

  // Settle position inside pillbox (36.5..37.5, 66.0, -186.5)
  if (bot.entity.position.distanceTo(new Vec3(37.0, 66.0, -186.5)) > 1.2) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(37.0, 66.0, -186.5, 0.4));
    } catch (e) {}
  }

  // Find all active blazes sorted by distance
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    // Face target directly to block fireballs
    await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

    // Strike if within 4.8m
    if (dist <= 4.8 && Date.now() - lastAttack > 620) {
      bot.deactivateItem(); // Lower shield for 1 swing
      try { await lib.equipWeapon(); } catch (e) {}
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      bot.activateItem(true); // Re-raise shield immediately!
      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`Blaze slain! Total kills: ${kills}`);
      }
    } else {
      bot.activateItem(true); // Maintain shield
    }
  } else {
    // Face spawner at (32, 68, -190) with shield raised
    await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
    bot.activateItem(true);
  }

  // Safe ground item vacuum
  const safeItems = Object.values(bot.entities).filter(e =>
    e.name === 'item' &&
    bot.entity.position.distanceTo(e.position) <= 3.0 &&
    e.position.x >= 35.0 &&
    e.position.z <= -185.0
  );
  for (const it of safeItems) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 0.4));
    } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`delta: Harvested Blaze Rod! Total: ${curRods}/8!`);
    console.log(`Harvested Blaze Rod! Total: ${curRods}/8!`);
    lastRods = curRods;
  }

  if (curRods >= 8) {
    bot.chat(`delta: MILESTONE 8 COMPLETE! 8+ Blaze Rods secured by Delta!`);
    console.log(`MILESTONE 8 COMPLETE! Rods: ${curRods}`);
    break;
  }

  await sleep(100);
}

bot.deactivateItem();
const finalRods = lib.count('blaze_rod');
console.log(`Combat end. Rods: ${finalRods}, Hits: ${hits}, Kills: ${kills}, HP: ${bot.health}`);

return {
  rods: finalRods,
  hits: hits,
  kills: kills,
  hp: bot.health,
  pos: bot.entity.position,
  inv: lib.inv()
};
