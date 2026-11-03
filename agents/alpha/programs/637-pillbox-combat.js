// programs/637-pillbox-combat.js
console.log('=== Program 637: Pillbox Combat & Blaze Rod Harvest ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Equip weapon
await lib.equipWeapon();
console.log('Equipped weapon:', bot.heldItem?.name);

// 1. Inspect ground and wall structure around (35..38, 65..68, -188..-184)
const cur = bot.entity.position;
console.log('Inspecting Pillbox layout...');
for (let y = 67; y >= 65; y--) {
  let row = `y=${y}: `;
  for (let x = 35; x <= 38; x++) {
    for (let z = -188; z <= -184; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air') {
        row += `(${x},${z}):${b.name} `;
      }
    }
  }
  console.log(row);
}

// 2. Check for nearby item drops
const items = Object.values(bot.entities)
  .filter(e => e.name === 'item' && e.isValid && bot.entity.position.distanceTo(e.position) < 12);
console.log('Nearby item drops:', items.map(i => `${i.name || 'item'} at ${lib.fmt(i.position)} dist ${bot.entity.position.distanceTo(i.position).toFixed(1)}m`).join(', ') || 'none');

// 3. Move safely into firing slit position at (36.0, 66.0, -186.5)
const targetStance = new Vec3(36.0, 66.0, -186.5);
const floorUnderStance = bot.blockAt(new Vec3(36, 65, -187));
console.log('Floor under target stance (36, 65, -187):', floorUnderStance?.name);

if (floorUnderStance && floorUnderStance.boundingBox === 'block') {
  console.log('Target stance floor is solid. Moving into firing position...');
  try {
    await lib.goTo(36.0, 66.0, -186.5, 0.5, { timeoutMs: 5000 });
  } catch (e) {
    console.log('Direct move note:', e.message);
    // manual walk
    await bot.lookAt(new Vec3(36.0, 66.0, -186.5));
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }
}
console.log('Current pos after positioning:', lib.fmt(bot.entity.position));

// 4. Safe stationary Blaze combat loop
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

bot.chat(`alpha: Locked behind pillbox wall at ${lib.fmt(bot.entity.position)}! Engaging Blazes! Rods: ${lib.count('blaze_rod')}/8`);

const combatStart = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;
let hits = 0;

while (!isCancelled() && Date.now() - combatStart < 100000) {
  // Low health emergency check
  if (bot.health <= 6) {
    console.log(`HP critical (${bot.health.toFixed(1)}/20)! Retreating along covered corridor to (44, 65, -169)...`);
    bot.chat(`alpha: HP critical (${bot.health.toFixed(1)}/20)! Falling back to corridor cover!`);
    try {
      await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 6000 });
    } catch (e) {}
    break;
  }

  // Find all active Blazes, sorted by distance
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    // Strike reach up to 4.5 blocks
    if (dist <= 4.5 && Date.now() - lastAttack > 625) {
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      console.log(`Hit Blaze at ${dist.toFixed(1)}m (Blaze HP: ${target.health !== undefined ? target.health.toFixed(1) : '?'}) [Hit #${hits}]`);
      if (target.health !== undefined && target.health <= 0) {
        killed++;
        console.log(`+++ BLAZE ELIMINATED! Total killed: ${killed} +++`);
      }
    }
  }

  // Safe stationary pickup (ONLY within 2.5m, never moving west of x=35.5)
  if (bot.entity.position.x >= 35.5 && Math.random() < 0.25) {
    try {
      await lib.pickup(2.5);
    } catch (e) {}
  }

  // Check blaze rod count
  const currentRods = lib.count('blaze_rod');
  if (currentRods !== lastRods) {
    console.log(`>>> BLAZE ROD HARVESTED! Total: ${currentRods}/8 <<<`);
    bot.chat(`alpha: BLAZE ROD HARVESTED! Total rods: ${currentRods}/8!`);
    lastRods = currentRods;
  }

  if (currentRods >= 8) {
    bot.chat(`alpha: MILESTONE 8 COMPLETE! Reached ${currentRods} Blaze Rods!`);
    break;
  }

  await sleep(150);
}

// Final pickup
if (bot.entity.position.x >= 35.5) {
  try { await lib.pickup(2.5); } catch (e) {}
}

const finalRods = lib.count('blaze_rod');
console.log(`=== Combat Round Ended. Killed: ${killed}, Hits: ${hits}, Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20 ===`);
bot.chat(`alpha: Combat round ended. Killed: ${killed}, Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);
