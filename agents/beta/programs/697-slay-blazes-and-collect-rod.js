// programs/697-slay-blazes-and-collect-rod.js
console.log('=== Program 697: Slay Blazes & Harvest Blaze Rods ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.clearControlStates();
bot.pathfinder.stop();

// Equip sword
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) {
  await bot.equip(sword, 'hand');
  console.log(`Equipped ${sword.name} in main hand!`);
}

// Check the dropped blaze_rod at (33, 68, -188)
const droppedRod = Object.values(bot.entities).find(e => e.name === 'item' && e.getDroppedItem && e.getDroppedItem()?.name === 'blaze_rod');
if (droppedRod) {
  console.log(`Blaze rod entity detected at ${lib.fmt(droppedRod.position)}, dist: ${bot.entity.position.distanceTo(droppedRod.position).toFixed(1)}m`);
}

// 1. Fortify overhead cover at x=35 before stepping forward
console.log('Placing overhead cover at x=35, y=68...');
for (const z of [-186, -187]) {
  const p = new Vec3(35, 68, z);
  const b = bot.blockAt(p);
  if (b && b.name === 'air' && lib.count('cobblestone') > 2) {
    try {
      await lib.place('cobblestone', p.x, p.y, p.z);
      console.log(`Placed cover at ${lib.fmt(p)}`);
    } catch (e) {
      console.log(`Cover note at ${lib.fmt(p)}:`, e.message);
    }
  }
}

// 2. Step forward to front firing slit at (35.5, 66.0, -186.5)
console.log('Moving into forward firing slit at (35.5, 66.0, -186.5)...');
try {
  await lib.goTo(35.5, 66.0, -186.5, 0.5, { dig: false, timeoutMs: 4000 });
} catch (e) {
  console.log('Movement note:', e.message);
}
console.log('Frontline position reached:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Pick up any items within reach (like the blaze rod!)
try { await lib.pickup(4.0); } catch (e) {}
console.log('Blaze rods currently held:', lib.count('blaze_rod'));

// 3. Combat Loop against Blazes
bot.chat(`Beta: Engaging Blazes at spawner frontline! Rods: ${lib.count('blaze_rod')}/8`);

const start = Date.now();
const targetRods = 8;
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let killed = 0;

while (!isCancelled() && Date.now() - start < 60000) {
  if (bot.health <= 6) {
    console.log(`HP low (${bot.health.toFixed(1)}), stepping back to (37, 66, -185) cover!`);
    try { await lib.goTo(37.0, 66.0, -185.0, 0.8, { dig: false, timeoutMs: 3000 }); } catch (e) {}
    await sleep(2000);
    continue;
  }

  // Find Blazes within melee reach (<= 4.5 blocks)
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    if (dist <= 4.8 && Date.now() - lastAttack > 625) {
      // Look at blaze head/center and attack
      await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.5, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      if (target.health !== undefined && target.health <= 0) {
        killed++;
        console.log(`Blaze slain! Kills: ${killed}`);
      }
    }
  }

  // Periodic safe pickup sweep
  if (Math.random() < 0.25) {
    try { await lib.pickup(3.5); } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    bot.chat(`Beta: Harvested Blaze Rod! Total: ${curRods}/${targetRods}`);
    lastRods = curRods;
  }

  if (curRods >= targetRods) {
    bot.chat(`Beta: Milestone 8 Complete! ${curRods} Blaze Rods secured!`);
    break;
  }

  await sleep(150);
}

// Final pickup
try { await lib.pickup(4.0); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log('Combat cycle complete.');
console.log('Blaze Rods in inventory:', finalRods);
console.log('Kills:', killed, 'HP:', bot.health, 'Pos:', lib.fmt(bot.entity.position));

return {
  rods: finalRods,
  killed,
  hp: bot.health,
  pos: bot.entity.position
};
