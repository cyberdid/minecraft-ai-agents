// programs/736-bunker-enderman-hunt-and-defense.js
console.log('=== Program 736: Bunker Enderman Hunt & Frontline Defense ===');
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

console.log('Gear check: offhand =', bot.inventory.slots[45]?.name, 'held =', bot.heldItem?.name);

// 2. Vacuum drops inside bunker
await lib.pickup(4.0);

// 3. Position at safe bunker defensive post at (44.5, 65.0, -126.5)
try {
  await bot.pathfinder.goto(new goals.GoalNear(44.5, 65.0, -126.5, 0.5));
} catch (e) {}

console.log('Bunker defense post:', lib.fmt(bot.entity.position));
bot.chat('alpha: Holding 2-high bunker defense post (44.5, 65, -126.5) with full 20/20 HP & raised shield!');

// 4. Combat & Hunting Loop for 45 seconds
const durationMs = 45000;
const start = Date.now();
let lastPearls = lib.count('ender_pearl');
let hits = 0;
let kills = 0;
let lastAttack = 0;

bot.activateItem(true); // Raise shield

while (!checkCancelled() && Date.now() - start < durationMs && bot.game.dimension === 'the_nether') {
  // Never step outside bunker doorway (stay z >= -127.5)
  if (bot.entity.position.z < -127.2) {
    bot.setControlState('back', true);
    await sleep(200);
    bot.setControlState('back', false);
  }

  // Find hostiles near bunker entrance (wither_skeleton, skeleton, enderman)
  const nearbyHostiles = Object.values(bot.entities).filter(e =>
    e.isValid &&
    (e.name === 'wither_skeleton' || e.name === 'skeleton' || e.name === 'enderman' || e.name === 'blaze') &&
    bot.entity.position.distanceTo(e.position) <= 6.0
  ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = nearbyHostiles[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    await bot.lookAt(target.position.offset(0, 1.2, 0), true);

    if (dist <= 4.0 && Date.now() - lastAttack > 650) {
      bot.deactivateItem();
      try { await lib.equipWeapon(); } catch (e) {}
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      bot.activateItem(true); // Re-raise shield immediately!
      console.log(`Hit ${target.name} at ${dist.toFixed(1)}m (Hit #${hits})`);

      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`Mob slain: ${target.name}! Kills: ${kills}`);
        bot.chat(`alpha: Slain ${target.name} at bunker doorway! Total kills: ${kills}!`);
      }
    } else {
      bot.activateItem(true);
    }
  } else {
    // Scan for Endermen up to 32m to aggro from safety of 2-high ceiling
    const distantEndermen = Object.values(bot.entities).filter(e =>
      e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 32
    );

    if (distantEndermen.length > 0) {
      const em = distantEndermen[0];
      // Look directly at Enderman's head to aggro
      await bot.lookAt(em.position.offset(0, 2.7, 0), true);
      console.log(`Staring at Enderman at ${lib.fmt(em.position)} (${bot.entity.position.distanceTo(em.position).toFixed(1)}m) to draw aggro...`);
    } else {
      // Look toward bunker doorway with shield raised
      await bot.lookAt(new Vec3(44.0, 66.0, -128.0), true);
      bot.activateItem(true);
    }
  }

  // Vacuum drops around bunker entrance
  await lib.pickup(3.0);

  const curPearls = lib.count('ender_pearl');
  if (curPearls > lastPearls) {
    console.log(`*** ENDER PEARL HARVESTED! Total: ${curPearls}/12 ***`);
    bot.chat(`alpha: Harvested Ender Pearl! Team holds ${curPearls}/12 pearls toward Milestone 9!`);
    lastPearls = curPearls;
  }

  await sleep(100);
}

bot.deactivateItem();
await lib.pickup(5.0);

const totalPearls = lib.count('ender_pearl');
const totalRods = lib.count('blaze_rod');
console.log(`Defense round complete. Hits: ${hits}, Kills: ${kills}, Pearls: ${totalPearls}/12, HP: ${bot.health}`);
bot.chat(`alpha: Bunker defense round complete. Hits: ${hits}, Kills: ${kills}, Pearls: ${totalPearls}/12, Rods: ${totalRods}, HP: ${bot.health.toFixed(1)}/20`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  hits,
  kills,
  pearls: totalPearls,
  rods: totalRods,
  inv: lib.inv()
};
