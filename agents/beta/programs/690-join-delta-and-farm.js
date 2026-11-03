// programs/690-join-delta-and-farm.js
console.log('=== Program 690: Enter Pillbox and Farm Blaze Rods ===');
console.log('Beta start Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at:`, lib.fmt(p.entity.position));
  }
}

// Move safely into the Pillbox next to Delta at (37, 66, -185..-186)
// First step onto z=-183 at x=36.5
console.log('Stepping onto pillbox walkway...');
try {
  await lib.goTo(36.5, 66, -184, 1.0, { dig: false, timeoutMs: 5000 });
} catch (e) {
  console.log('Step 1 note:', e.message);
}

try {
  await lib.goTo(37.0, 66, -186, 1.0, { dig: false, timeoutMs: 5000 });
} catch (e) {
  console.log('Step 2 note:', e.message);
}

console.log('Beta pos now:', lib.fmt(bot.entity.position));

// Now farm Blazes with valid isCancelled function!
bot.chat('Beta: Standing shoulder-to-shoulder with Delta at Spawner Pillbox! Slaying Blazes!');

const start = Date.now();
const targetRods = 8;
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;

while (!isCancelled() && Date.now() - start < 150000) {
  if (bot.health <= 6) {
    console.log(`HP low (${bot.health.toFixed(1)}), staying low in cover.`);
    await sleep(1000);
    continue;
  }

  // Find Blazes within melee reach
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
        console.log(`Slew Blaze! Kills: ${killed}`);
      }
    }
  }

  // Safe stationary pickup
  if (bot.entity.position.x >= 35.5 && Math.random() < 0.25) {
    try { await lib.pickup(2.5); } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`Beta: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
    lastRods = curRods;
  }

  if (curRods >= targetRods) {
    bot.chat(`Beta: 8 Blaze Rods secured! [Into Fire] achieved!`);
    console.log('Blaze Rod goal reached!');
    break;
  }

  await sleep(150);
}

try { if (bot.entity.position.x >= 35.5) await lib.pickup(3.0); } catch (e) {}

console.log('Combat cycle ended.');
console.log('Blaze Rods in inventory:', lib.count('blaze_rod'));
console.log('Health:', bot.health, 'Pos:', lib.fmt(bot.entity.position));
return {
  rods: lib.count('blaze_rod'),
  killed,
  hp: bot.health,
  pos: bot.entity.position
};
