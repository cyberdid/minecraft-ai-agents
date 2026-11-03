// programs/439-step-to-slit-and-reap.js
console.log('=== STEP TO SLIT & REAP BLAZE RODS (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Cancel previous background loops
const myAssaultId = Date.now();
globalThis.activeAssaultId = myAssaultId;
bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

// Ensure sword equipped in hand and shield in offhand
try {
  const sword = bot.inventory.items().find(i => i.name.includes('sword'));
  if (sword) await bot.equip(sword, 'hand');
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

console.log('Equipped: Hand =', bot.heldItem?.name, ', Offhand =', bot.inventory.slots[45]?.name);

// 1. Step directly to firing slit at (36.0, 66.0, -187.0)
console.log('Stepping to firing slit at (36.0, 66.0, -187.0)...');
const slitPos = new Vec3(36.0, 66.0, -187.0);
await bot.lookAt(slitPos.offset(0, 1.5, 0), true);

let t0 = Date.now();
bot.setControlState('forward', true);
while (bot.entity.position.distanceTo(slitPos) > 0.4 && Date.now() - t0 < 3000) {
  if (bot.entity.position.x <= 35.8) break; // never step past guardrail!
  await sleep(50);
}
bot.setControlState('forward', false);
bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

console.log('Locked at slit! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat('gamma: Locked directly at firing slit (36, 66, -187)! Slaying Blazes for Milestone 8!');

// Vacuum any dropped items already sitting at the station
try {
  const p = await lib.pickup(4);
  if (p > 0) console.log(`Vacuumed ${p} ground items at slit!`);
} catch (e) {}

const farmStart = Date.now();
const targetRods = 8;
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;

console.log(`Starting attack loop. Current rods = ${lastRods}`);

while (!isCancelled() && Date.now() - farmStart < 170000) {
  if (globalThis.activeAssaultId !== myAssaultId) break;

  // Find all Blazes within reach
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    if (dist <= 5.2 && Date.now() - lastAttack > 625) {
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      if (target.health !== undefined && target.health <= 0) {
        killed++;
        console.log(`Blaze eliminated! Total kills = ${killed}`);
      }
    }
  }

  // Vacuum drops stationary
  if (Math.random() < 0.3) {
    try { await lib.pickup(3.8); } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`gamma: Blaze Rod harvested! Total: ${curRods}/${targetRods}`);
    lastRods = curRods;
    console.log(`*** BLAZE ROD ACQUIRED! Count = ${curRods} ***`);
  }

  if (curRods >= targetRods) {
    bot.chat(`gamma: MILESTONE 8 COMPLETE! Harvested ${curRods} Blaze Rods!`);
    console.log(`Milestone 8 reached with ${curRods} rods!`);
    break;
  }

  await sleep(80);
}

try { await lib.pickup(4.0); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log(`Combat cycle finished. Blaze Rods: ${finalRods}, Kills: ${killed}, HP: ${bot.health}, Pos: ${lib.fmt(bot.entity.position)}`);

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: finalRods,
  killed,
  inv: lib.inv()
};
