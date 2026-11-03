// programs/423-pure-blaze-slayer.js
console.log('=== PURE BLAZE SLAYER & ROD HARVEST (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Equip stone sword
try { await lib.equipWeapon(); } catch (e) {}
console.log('Held weapon:', bot.heldItem?.name);

// 2. Align to optimal firing station at (36.5, 66.0, -186.0)
try {
  await bot.pathfinder.goto(new goals.GoalNear(36.5, 66.0, -186.0, 0.4));
} catch (e) {}

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Firmly locked at station:', lib.fmt(bot.entity.position));
bot.chat('gamma: Locked at Spawner firing slit with Delta! Slaying Blazes for Milestone 8!');

const farmStart = Date.now();
const targetRods = 8;
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;

// Vacuum any dropped items already sitting at the station
try {
  const p = await lib.pickup(4);
  if (p > 0) console.log(`Picked up ${p} initial drops!`);
} catch (e) {}

while (!isCancelled() && Date.now() - farmStart < 150000) {
  // If HP drops low, hold stationary behind wall
  if (bot.health <= 5) {
    await sleep(800);
    continue;
  }

  // Find Blazes
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    if (dist <= 4.8 && Date.now() - lastAttack > 625) {
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      if (target.health !== undefined && target.health <= 0) {
        killed++;
        console.log(`Blaze eliminated! Total kills: ${killed}`);
      }
    }
  }

  // Regular drop vacuuming
  if (Math.random() < 0.3) {
    try { await lib.pickup(3.8); } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`gamma: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
    lastRods = curRods;
    console.log(`*** BLAZE ROD ACQUIRED! Count = ${curRods} ***`);
  }

  if (curRods >= targetRods) {
    bot.chat(`gamma: MILESTONE 8 COMPLETE! Reached ${curRods} Blaze Rods!`);
    console.log(`Milestone reached with ${curRods} rods!`);
    break;
  }

  await sleep(100);
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
