// programs/723-pillbox-slay-blazes.js
console.log('=== Program 723: Pillbox Slay Blazes & Harvest Rods ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Ensure shield is equipped in offhand and iron sword in hand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

try {
  const sword = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sword) await bot.equip(sword, 'hand');
  else await lib.equipWeapon();
} catch (e) {}

console.log('Gear check: offhand =', bot.inventory.slots[45]?.name, 'held =', bot.heldItem?.name);

// 2. Verify solid battlement at (35, 66, -187)
const battlement = bot.blockAt(new Vec3(35, 66, -187));
console.log('Battlement at (35, 66, -187):', battlement?.name);
if (battlement && (battlement.name === 'air' || battlement.name === 'cave_air') && lib.count('cobblestone') > 0) {
  try {
    await lib.place('cobblestone', 35, 66, -187);
    console.log('Placed safety battlement at (35, 66, -187)!');
  } catch (e) {}
}

// 3. Move into firing slit position at (35.9, 66.0, -187.0)
console.log('Stepping to firing slit at (35.9, 66.0, -187.0)...');
try {
  await bot.lookAt(new Vec3(35.9, 66.0, -187.0), true);
  const targetPos = new Vec3(35.9, 66.0, -187.0);
  if (bot.entity.position.distanceTo(targetPos) > 0.4) {
    bot.setControlState('forward', true);
    await sleep(350);
    bot.setControlState('forward', false);
  }
} catch (e) {}

console.log('At firing slit:', lib.fmt(bot.entity.position));
bot.chat(`alpha: Locked into firing slit (${lib.fmt(bot.entity.position)}) with raised shield! Engaging Blazes!`);

// 4. Combat loop
const durationMs = 80000;
const start = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;
let hits = 0;
let kills = 0;

// Raise shield facing spawner
bot.activateItem(true);
await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);

while (!checkCancelled() && Date.now() - start < durationMs && bot.game.dimension === 'the_nether') {
  // If HP low, hold stationary shield
  if (bot.health <= 6) {
    bot.activateItem(true);
    await sleep(800);
    continue;
  }

  // Guard against falling west of x=35.5
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
    // Face Blaze directly to block fireballs with shield
    await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

    // Strike if within melee range (<= 4.8m)
    if (dist <= 4.8 && Date.now() - lastAttack > 625) {
      bot.deactivateItem(); // Lower shield for 1 tick
      try {
        const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
        if (sw && bot.heldItem?.name !== 'iron_sword') await bot.equip(sw, 'hand');
      } catch (e) {}
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      bot.activateItem(true); // Re-raise shield immediately!
      console.log(`Hit Blaze at ${dist.toFixed(1)}m (Hit #${hits})`);

      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`Blaze Slain! Total kills: ${kills}`);
        bot.chat(`alpha: Blaze slain! Kills: ${kills}`);
      }
    } else {
      bot.activateItem(true);
    }
  } else {
    // Face spawner with shield raised
    await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
    bot.activateItem(true);
  }

  // Vacuum drops safely (staying strictly x >= 35.5)
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
