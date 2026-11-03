// programs/439-vacuum-drops-and-slay.js
globalThis.isCancelled = isCancelled;

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Equip stone sword
try { await lib.equipWeapon(); } catch (e) {}

// 2. Scan for dropped items within 10m
const allDrops = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 10.0);
console.log(`Found ${allDrops.length} dropped item entities within 10m:`);
for (const item of allDrops) {
  console.log(`  Drop #${item.id} at ${lib.fmt(item.position)} dist: ${bot.entity.position.distanceTo(item.position).toFixed(1)}m`);
}

// 3. Step forward to slit position: (36.2, 66.0, -186.5)
const slitSpot = new Vec3(36.2, 66.0, -186.5);
console.log('Moving into forward slit spot:', lib.fmt(slitSpot));
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

try {
  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);
  await bot.pathfinder.goto(new goals.GoalNear(slitSpot.x, slitSpot.y, slitSpot.z, 0.3));
} catch (e) {
  console.log('goto slitSpot note:', e.message);
}

console.log('Positioned at:', lib.fmt(bot.entity.position));

// 4. Combat loop
const farmDurationMs = 180000; // 3 minutes
const startTime = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let hits = 0;
let killed = 0;

console.log(`Blaze slayer active at forward slit. Starting rods: ${lastRods}`);
bot.chat(`delta: Slaying Blazes at Spawner slit! Rods: ${lastRods}/8, HP: ${bot.health.toFixed(1)}`);

while (!isCancelled() && Date.now() - startTime < farmDurationMs) {
  // Find nearest Blaze within 5.0m
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    if (dist <= 4.8 && Date.now() - lastAttack > 625) {
      try { await lib.equipWeapon(); } catch (e) {}
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      console.log(`Hit Blaze at dist ${dist.toFixed(1)}m (hit #${hits})`);
      if (target.health !== undefined && target.health <= 0) killed++;
    }
  }

  // Safe pickup: look for items that dropped near slit (x >= 35.0, z <= -185.0)
  const reachableItems = Object.values(bot.entities).filter(e => 
    e.name === 'item' && 
    bot.entity.position.distanceTo(e.position) <= 3.0 &&
    e.position.x >= 35.0 &&
    e.position.z <= -185.0
  );
  for (const item of reachableItems) {
    if (bot.entity.position.distanceTo(item.position) > 1.2) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.4));
      } catch (e) {}
    }
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`delta: Harvested Blaze Rod! Total: ${curRods}/8`);
    console.log(`Harvested Blaze Rod! Total: ${curRods}/8`);
    lastRods = curRods;
  }

  if (curRods >= 8) {
    console.log('Milestone 8 target reached: 8+ Blaze Rods!');
    bot.chat(`delta: Milestone 8 Target Reached: ${curRods} Blaze Rods!`);
    break;
  }

  await sleep(100);
}

const totalRods = lib.count('blaze_rod');
console.log(`Combat cycle end. Total hits: ${hits}, Killed: ${killed}, Rods: ${totalRods}/8, HP: ${bot.health}`);
bot.chat(`delta: Pillbox combat complete. Blaze Rods held: ${totalRods}/8, HP: ${bot.health.toFixed(1)}`);

if (totalRods >= 8) {
  bot.chat('delta: 8+ Blaze Rods secured! Retreating to Overworld base to deposit.');
  console.log('Retreating to Overworld base...');
  const retRes = await retreatToOverworldBase();
  console.log('Retreat result:', JSON.stringify(retRes));

  if (bot.game.dimension === 'overworld') {
    try {
      await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
      bot.chat('delta: Deposited all Blaze Rods in base chest (293, 72, -57)! Milestone 8 COMPLETE!');
    } catch (e) {}
  }
}
