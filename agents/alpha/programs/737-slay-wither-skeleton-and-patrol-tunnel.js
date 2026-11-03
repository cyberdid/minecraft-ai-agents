// programs/737-slay-wither-skeleton-and-patrol-tunnel.js
console.log('=== Program 737: Slay Wither Skeleton & Patrol Covered Tunnel ===');
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

// 2. Scan for Wither Skeleton within 16m
const witherSkeletons = Object.values(bot.entities).filter(e =>
  e.name === 'wither_skeleton' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16
);
console.log(`Wither skeletons nearby: ${witherSkeletons.length}`);

if (witherSkeletons.length > 0) {
  const ws = witherSkeletons[0];
  console.log(`Engaging Wither Skeleton at ${lib.fmt(ws.position)} (${bot.entity.position.distanceTo(ws.position).toFixed(1)}m)...`);
  bot.chat(`alpha: Engaging Wither Skeleton through 2-high doorway with raised shield!`);

  // Move to doorway inside bunker at (44.5, 65.0, -126.8)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44.5, 65.0, -126.8, 0.4));
  } catch (e) {}

  const wsStart = Date.now();
  let lastHit = 0;
  bot.activateItem(true); // Raise shield

  while (!checkCancelled() && ws.isValid && Date.now() - wsStart < 15000) {
    const dist = bot.entity.position.distanceTo(ws.position);
    await bot.lookAt(ws.position.offset(0, 0.8, 0), true);

    if (dist <= 4.0 && Date.now() - lastHit > 625) {
      bot.deactivateItem();
      try { await lib.equipWeapon(); } catch (e) {}
      bot.attack(ws);
      lastHit = Date.now();
      bot.activateItem(true);
      console.log(`Struck Wither Skeleton at ${dist.toFixed(1)}m!`);
    } else {
      bot.activateItem(true);
    }
    await sleep(80);
  }
  bot.deactivateItem();
  await lib.pickup(4.0);
}

// 3. Patrol covered tunnel from (44, 65, -127) to (44, 65, -165)
console.log('Patrolling covered tunnel towards z=-165...');
const patrolPoints = [
  new Vec3(44.5, 65.0, -135.0),
  new Vec3(44.5, 65.0, -145.0),
  new Vec3(44.5, 65.0, -155.0),
  new Vec3(44.5, 65.0, -165.0)
];

for (let i = 0; i < patrolPoints.length && !checkCancelled(); i++) {
  const pt = patrolPoints[i];
  console.log(`Patrol point ${i + 1}/${patrolPoints.length}: ${lib.fmt(pt)}...`);

  // Pitch gaze down to feet level (y=64) to avoid Enderman aggro outside cover
  await bot.lookAt(new Vec3(pt.x, 64.0, pt.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(pt.x, pt.y, pt.z, 1.2));
  } catch (e) {
    try { await lib.goTo(pt.x, pt.y, pt.z, 1.5, { dig: false, timeoutMs: 5000 }); } catch (e2) {}
  }

  // Vacuum drops along tunnel floor
  await lib.pickup(3.0);

  // Check for Enderman in 2-high covered tunnel
  const enderman = Object.values(bot.entities).find(e =>
    e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 12
  );
  if (enderman) {
    console.log(`Enderman spotted in covered corridor at ${lib.fmt(enderman.position)}! Attacking safely under 2-high ceiling!`);
    bot.chat('alpha: Slaying Enderman under 2-high covered ceiling for Ender Pearl!');
    const emStart = Date.now();
    let emHit = 0;
    while (!checkCancelled() && enderman.isValid && Date.now() - emStart < 12000) {
      const d = bot.entity.position.distanceTo(enderman.position);
      await bot.lookAt(enderman.position.offset(0, 1.0, 0), true);
      if (d <= 3.8 && Date.now() - emHit > 625) {
        try { await lib.equipWeapon(); } catch (e) {}
        bot.attack(enderman);
        emHit = Date.now();
      }
      await sleep(100);
    }
    await lib.pickup(5.0);
  }
}

const pearls = lib.count('ender_pearl');
const rods = lib.count('blaze_rod');
console.log(`Patrol complete at: ${lib.fmt(bot.entity.position)}, Pearls: ${pearls}/12, Rods: ${rods}, HP: ${bot.health}`);
bot.chat(`alpha: Covered tunnel patrol complete! Pos: ${lib.fmt(bot.entity.position)}, Pearls: ${pearls}/12, HP: ${bot.health.toFixed(1)}/20`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  pearls,
  rods,
  inv: lib.inv()
};
