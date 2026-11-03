// programs/435-pillbox-blaze-slayer.js
globalThis.isCancelled = isCancelled;

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Equip weapon
try { await lib.equipWeapon(); } catch (e) {}

// 2. Position at pillbox slit: (36.5, 66.0, -186.0)
const slitPos = new Vec3(36.5, 66.0, -186.0);
console.log('Positioning at slit pos:', lib.fmt(slitPos));
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

await bot.lookAt(slitPos.offset(0, 1.0, 0), true);
bot.setControlState('forward', true);
const alignStart = Date.now();
while (bot.entity.position.distanceTo(slitPos) > 0.4 && Date.now() - alignStart < 3000 && !isCancelled()) {
  await sleep(100);
}
bot.setControlState('forward', false);

console.log('Aligned at:', lib.fmt(bot.entity.position), 'held:', bot.heldItem?.name);

// 3. Aim at Blaze Spawner (32, 68, -190)
const spawnerPos = new Vec3(32.0, 68.0, -190.0);
await bot.lookAt(spawnerPos, true);

// 4. Combat loop
const farmDurationMs = 180000; // 3 minutes
const startTime = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let hits = 0;
let killed = 0;

console.log(`Starting Blaze slayer loop. Initial Blaze Rods: ${lastRods}`);
bot.chat(`delta: Slaying Blazes through Pillbox slit! Starting Rods: ${lastRods}/8`);

while (!isCancelled() && Date.now() - startTime < farmDurationMs) {
  // If HP gets critically low (<= 4), step back 1.5 blocks behind full cobblestone wall
  if (bot.health <= 4.0) {
    console.log(`HP critical (${bot.health.toFixed(1)}), stepping back into cover...`);
    await bot.lookAt(new Vec3(38.0, 66.0, -185.0), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
    await sleep(2000); // wait behind wall
    // Step back to slit
    await bot.lookAt(slitPos.offset(0, 1.0, 0), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  }

  // Find nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    if (dist <= 4.8 && Date.now() - lastAttack > 625) {
      try { await lib.equipWeapon(); } catch (e) {}
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.6, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      console.log(`Hit Blaze #${target.id} at dist ${dist.toFixed(1)}m (total hits: ${hits})`);
      if (target.health !== undefined && target.health <= 0) {
        killed++;
        console.log(`Killed Blaze! Total killed: ${killed}`);
      }
    }
  }

  // Check for drops vacuum
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

const finalRods = lib.count('blaze_rod');
console.log(`Combat cycle end. Total hits: ${hits}, Killed: ${killed}, Rods: ${finalRods}/8, HP: ${bot.health}`);
bot.chat(`delta: Pillbox combat finished. Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}`);

// If 8 rods collected, retreat to Overworld base!
if (finalRods >= 8) {
  bot.chat('delta: Milestone 8 COMPLETE! Retreating to Overworld base to deposit Blaze Rods.');
  console.log('Retreating to Overworld base...');
  const retRes = await retreatToOverworldBase();
  console.log('Retreat result:', JSON.stringify(retRes));

  if (bot.game.dimension === 'overworld') {
    try {
      await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
      bot.chat('delta: Deposited all Blaze Rods into chest (293, 72, -57)! Milestone 8 100% COMPLETE!');
    } catch (e) {}
  }
}
