console.log('=== PROGRAM 695: DELTA FRONTLINE BLAZE SLAYER ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Maintain golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}
try { await lib.equipWeapon(); } catch (e) {}

// Step forward directly to firing slit at (36.2, 66.0, -186.5)
console.log('Stepping to frontline firing slit at (36.2, 66.0, -186.5)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(36.2, 66.0, -186.5, 0.3));
} catch (e) {}

console.log('At firing slit! Pos:', lib.fmt(bot.entity.position));
bot.activateItem(true); // Raise shield

let lastAttack = 0;
let hits = 0;
let kills = 0;
let lastRods = lib.count('blaze_rod');
const startTime = Date.now();
const COMBAT_DURATION = 90000;

console.log(`Starting Blaze Rods: ${lastRods}. Fighting Blazes for ${COMBAT_DURATION/1000}s...`);
bot.chat(`delta: Fighting Blazes from frontline firing slit (${lib.fmt(bot.entity.position)})! Rods held: ${lastRods}.`);

while (Date.now() - startTime < COMBAT_DURATION && !checkCancelled()) {
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

  // Maintain slit position
  if (bot.entity.position.distanceTo(new Vec3(36.2, 66.0, -186.5)) > 0.8) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(36.2, 66.0, -186.5, 0.3));
    } catch (e) {}
  }

  // Find Blazes
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

    if (dist <= 4.5 && Date.now() - lastAttack > 600) {
      bot.deactivateItem(); // Lower shield
      try { await lib.equipWeapon(); } catch (e) {}
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      bot.activateItem(true); // Re-raise shield immediately!
      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`Blaze slain! Kills: ${kills}`);
      }
    } else {
      bot.activateItem(true);
    }
  } else {
    // Face spawner at (32, 68, -190)
    await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
    bot.activateItem(true);
  }

  // Safe ground item vacuum
  const safeItems = Object.values(bot.entities).filter(e =>
    e.name === 'item' &&
    bot.entity.position.distanceTo(e.position) <= 3.2 &&
    e.position.x >= 34.5 &&
    e.position.z <= -185.0
  );
  for (const it of safeItems) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 0.4));
    } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`delta: Harvested Blaze Rod! Total held: ${curRods}!`);
    console.log(`Harvested Blaze Rod! Total: ${curRods}`);
    lastRods = curRods;
  }

  if (curRods >= 6) {
    bot.chat(`delta: Harvested ${curRods} Blaze Rods! Team target reached!`);
    console.log(`Target reached: ${curRods} rods!`);
    break;
  }

  await sleep(100);
}

bot.deactivateItem();
const finalRods = lib.count('blaze_rod');
console.log(`Session finished. Final Blaze Rods held: ${finalRods}, Hits: ${hits}, Kills: ${kills}, HP: ${bot.health}`);

return {
  rods: finalRods,
  hits: hits,
  kills: kills,
  hp: bot.health,
  pos: bot.entity.position,
  inv: lib.inv()
};
