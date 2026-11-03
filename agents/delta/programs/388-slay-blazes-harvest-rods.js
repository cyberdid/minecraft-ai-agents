// programs/388-slay-blazes-harvest-rods.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// Lock position: stay stationary behind the pillbox wall
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Vacuum nearby drops at pillbox
try {
  const p = await lib.pickup(4);
  if (p > 0) console.log(`Picked up ${p} drops!`);
} catch (e) {}

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const startRods = lib.count('blaze_rod');
console.log(`Starting Blaze rods: ${startRods}`);

const combatStart = Date.now();
let lastAttack = 0;
let killed = 0;

console.log('Beginning stationary Blaze combat loop...');
while (!isCancelled() && Date.now() - combatStart < 45000) {
  // Check health: if low, retreat 2 blocks to safety under roof
  if (bot.health < 6) {
    console.log(`WARNING: Health critical (${bot.health}/20)! Taking cover...`);
    try { await lib.goTo(37, 65, -177, 1, { timeoutMs: 3000 }); } catch (e) {}
    break;
  }
  
  // Find nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && e.health > 0)
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  
  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    if (dist <= 4.5 && Date.now() - lastAttack > 650) {
      await bot.lookAt(target.position.offset(0, target.height * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      console.log(`Attacked Blaze at dist ${dist.toFixed(1)}m (Blaze HP: ${target.health})`);
      if (target.health <= 0) {
        killed++;
        console.log(`Blaze eliminated! Total killed this round: ${killed}`);
      }
    }
  }
  
  // Vacuum drops within stationary reach
  if (Math.random() < 0.15) {
    try { await lib.pickup(3); } catch (e) {}
  }
  
  await sleep(100);
}

// Final pickup
try { await lib.pickup(4); } catch (e) {}

const currentRods = lib.count('blaze_rod');
console.log(`Combat round complete. Rods: ${currentRods} (gained ${currentRods - startRods}), HP: ${bot.health}`);

if (currentRods > startRods) {
  bot.chat(`delta: Harvested Blaze Rod! Total rods in hand: ${currentRods}!`);
} else {
  bot.chat(`delta: Slaying Blazes at Spawner Pillbox! HP: ${bot.health}/20, Rods: ${currentRods}`);
}
