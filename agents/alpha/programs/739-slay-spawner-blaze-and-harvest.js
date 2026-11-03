// programs/739-slay-spawner-blaze-and-harvest.js
console.log('=== Program 739: Slay Spawner Blaze & Harvest Rods ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield and iron sword
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

try {
  const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sw) await bot.equip(sw, 'hand');
  else await lib.equipWeapon();
} catch (e) {}

// 2. Step forward to firing slit at (35.9, 66.0, -187.0) with raised shield
bot.activateItem(true);
await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);

try {
  const slitPos = new Vec3(35.9, 66.0, -187.0);
  if (bot.entity.position.distanceTo(slitPos) > 0.4) {
    await bot.lookAt(slitPos, true);
    bot.setControlState('forward', true);
    await sleep(300);
    bot.setControlState('forward', false);
  }
} catch (e) {}

console.log('At firing slit:', lib.fmt(bot.entity.position));
bot.chat(`alpha: Locked into firing slit (${lib.fmt(bot.entity.position)}) with raised shield! Engaging Blazes!`);

// 3. Combat loop
const durationMs = 45000;
const start = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let hits = 0;
let kills = 0;

while (!checkCancelled() && Date.now() - start < durationMs && bot.game.dimension === 'the_nether') {
  // If HP low, step back into pillbox cover
  if (bot.health <= 6) {
    bot.activateItem(true);
    if (bot.entity.position.x < 37.0) {
      bot.setControlState('back', true);
      await sleep(250);
      bot.setControlState('back', false);
    }
    await sleep(600);
    continue;
  }

  // Never step west of x=35.5
  if (bot.entity.position.x < 35.6) {
    bot.setControlState('back', true);
    await sleep(150);
    bot.setControlState('back', false);
  }

  // Find nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

    // Strike if within 4.8m
    if (dist <= 4.8 && Date.now() - lastAttack > 625) {
      bot.deactivateItem();
      try {
        const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
        if (sw && bot.heldItem?.name !== 'iron_sword') await bot.equip(sw, 'hand');
      } catch (e) {}
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      bot.activateItem(true);
      console.log(`Struck Blaze at ${dist.toFixed(1)}m (Hit #${hits})`);

      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`+++ Blaze Slain! Total kills: ${kills} +++`);
        bot.chat(`alpha: Blaze slain! Total kills: ${kills}!`);
      }
    } else {
      bot.activateItem(true);
    }
  } else {
    // Face spawner with shield raised
    await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
    bot.activateItem(true);
  }

  // Vacuum drops behind battlement
  const items = Object.values(bot.entities).filter(e =>
    e.name === 'item' &&
    bot.entity.position.distanceTo(e.position) <= 3.2 &&
    e.position.x >= 35.5
  );
  for (const it of items) {
    try {
      await bot.lookAt(it.position, true);
      await lib.pickup(2.0);
    } catch (e) {}
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > lastRods) {
    console.log(`*** BLAZE ROD HARVESTED! Total: ${curRods} ***`);
    bot.chat(`alpha: Harvested Blaze Rod! Alpha holds ${curRods} Blaze Rods!`);
    lastRods = curRods;
  }

  await sleep(80);
}

bot.deactivateItem();
await lib.pickup(4.0);

const totalRods = lib.count('blaze_rod');
console.log(`Combat complete. Hits: ${hits}, Kills: ${kills}, Rods: ${totalRods}, HP: ${bot.health}`);
bot.chat(`alpha: Pillbox combat complete. Hits: ${hits}, Kills: ${kills}, Rods: ${totalRods}, HP: ${bot.health.toFixed(1)}/20`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  hits,
  kills,
  rods: totalRods,
  inv: lib.inv()
};
