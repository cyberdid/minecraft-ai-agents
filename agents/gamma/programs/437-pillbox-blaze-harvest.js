// programs/437-pillbox-blaze-harvest.js
console.log('=== PURE STATIONARY BLAZE HARVEST (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Cancel previous background loops
const myAssaultId = Date.now();
globalThis.activeAssaultId = myAssaultId;
bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// 1. Equip stone sword in hand, shield in offhand
try {
  const sword = bot.inventory.items().find(i => i.name.includes('sword'));
  if (sword) await bot.equip(sword, 'hand');
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

console.log('Equipped: Hand =', bot.heldItem?.name, ', Offhand =', bot.inventory.slots[45]?.name);

// 2. Step precisely to firing slit at (36.5, 66.0, -186.0)
try {
  await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -186.0, 0.4));
} catch (e) {}

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Stationary at slit:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat('gamma: Locked at Spawner Pillbox firing slit with Shield! Harvesting Blaze Rods!');

// Raise shield
bot.activateItem(true);

// Vacuum any dropped items on station
try {
  const p = await lib.pickup(4);
  if (p > 0) console.log(`Picked up ${p} ground items at station!`);
} catch (e) {}

const farmStart = Date.now();
const targetRods = 8;
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;

console.log(`Starting combat loop. Initial rods = ${lastRods}`);

while (!isCancelled() && Date.now() - farmStart < 160000) {
  if (globalThis.activeAssaultId !== myAssaultId) break;

  // Find Blazes
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    if (dist <= 4.8 && Date.now() - lastAttack > 625) {
      bot.deactivateItem(); // lower shield to strike
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      await sleep(100);
      bot.activateItem(true); // shield back up!

      if (target.health !== undefined && target.health <= 0) {
        killed++;
        console.log(`Blaze eliminated! Total kills = ${killed}`);
      }
    }
  }

  // Vacuum drops
  if (Math.random() < 0.25) {
    try { await lib.pickup(3.8); } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`gamma: Blaze Rod harvested! Total: ${curRods}/${targetRods}`);
    lastRods = curRods;
    console.log(`*** BLAZE ROD COLLECTED! Total = ${curRods} ***`);
  }

  if (curRods >= targetRods) {
    bot.chat(`gamma: MILESTONE 8 COMPLETE! Harvested ${curRods} Blaze Rods!`);
    console.log(`Milestone reached with ${curRods} rods!`);
    break;
  }

  await sleep(100);
}

try { await lib.pickup(4.0); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log(`Harvest cycle complete. Blaze Rods: ${finalRods}, Kills: ${killed}, HP: ${bot.health}, Pos: ${lib.fmt(bot.entity.position)}`);

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: finalRods,
  killed,
  inv: lib.inv()
};
