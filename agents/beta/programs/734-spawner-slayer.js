// programs/734-spawner-slayer.js
console.log('=== Program 734: Precision Spawner Slayer ===');
console.log('Bot:', bot.username, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Equip shield in offhand and sword in hand
const offhand = bot.inventory.slots[45];
if (offhand?.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

// Stand at true firing position (36.0, 66.0, -188.0)
const firingPos = new Vec3(36.0, 66.0, -188.0);
try {
  await bot.pathfinder.goto(new goals.GoalNear(firingPos.x, firingPos.y, firingPos.z, 0.4));
} catch (e) {}

// Settle and raise shield facing spawner
await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
bot.activateItem(true);

const farmDurationMs = 100000;
const startTime = Date.now();
const targetRods = 8;
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let hits = 0;
let kills = 0;

bot.chat(`Beta: At firing slit (36.0, 66, -188) with raised shield! Slaying Blazes for Milestone 8! Rods: ${lastRods}/8`);

while (!isCancelled() && Date.now() - startTime < farmDurationMs && bot.game.dimension === 'the_nether') {
  // Never step west of x=35.8 into abyss
  if (bot.entity.position.x < 35.8) {
    bot.setControlState('back', true);
    await sleep(150);
    bot.setControlState('back', false);
  }

  // Ensure shield is raised
  bot.activateItem(true);

  // 1. Check for immediate melee threats (Piglins, Wither Skeletons)
  const flankers = Object.values(bot.entities).filter(e =>
    e.isValid && (e.health === undefined || e.health > 0) &&
    ['piglin', 'wither_skeleton', 'zombified_piglin', 'magma_cube'].includes(e.name) &&
    bot.entity.position.distanceTo(e.position) <= 4.5
  );

  // 2. Check for Blazes in melee reach (<= 4.2m)
  const blazes = Object.values(bot.entities).filter(e =>
    e.isValid && e.name === 'blaze' && (e.health === undefined || e.health > 0)
  ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = flankers[0] || (blazes[0] && bot.entity.position.distanceTo(blazes[0].position) <= 4.2 ? blazes[0] : null);

  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    // Face target directly
    await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.6, 0), true);

    // Strike if cooldown ready (> 625ms)
    if (Date.now() - lastAttack > 625) {
      bot.deactivateItem(); // Lower shield
      try { await bot.equip(sword, 'hand'); } catch (e) {}
      bot.attack(target);   // Strike!
      lastAttack = Date.now();
      hits++;
      bot.activateItem(true); // Raise shield immediately!

      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`Killed ${target.name}! Total kills: ${kills}`);
      }
    }
  } else if (blazes[0]) {
    // Face the nearest blaze to block incoming fireballs with shield
    const nearest = blazes[0];
    await bot.lookAt(nearest.position.offset(0, (nearest.height || 1.8) * 0.7, 0), true);
    bot.activateItem(true);
  } else {
    // Face spawner
    await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
    bot.activateItem(true);
  }

  // Vacuum nearby items (x >= 35.0, distance <= 3.5m)
  const droppedItems = Object.values(bot.entities).filter(e =>
    e.name === 'item' &&
    bot.entity.position.distanceTo(e.position) <= 3.5 &&
    e.position.x >= 35.0
  );
  for (const it of droppedItems) {
    try {
      if (it.position.x >= 35.8) {
        await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 0.4));
      }
    } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`Beta: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
    console.log(`Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
    lastRods = curRods;
  }

  if (curRods >= targetRods) {
    bot.chat(`Beta: MILESTONE 8 COMPLETE! We have ${curRods} Blaze Rods!`);
    break;
  }

  await sleep(100);
}

bot.deactivateItem();
const finalRods = lib.count('blaze_rod');
console.log(`Session complete. Hits: ${hits}, Kills: ${kills}, Rods: ${finalRods}/${targetRods}, HP: ${bot.health}`);
bot.chat(`Beta: Combat session complete. Blaze Rods held: ${finalRods}/${targetRods}, HP: ${bot.health.toFixed(1)}`);

return {
  pos: bot.entity.position,
  blaze_rods: finalRods,
  hits,
  kills,
  hp: bot.health
};
