// programs/393-arm-alpha-and-slay-blaze.js
console.log('=== ARM ALPHA & SLAY BLAZES AT SPAWNER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check for Alpha and share a stone sword!
const alphaEntity = Object.values(bot.entities).find(e => e && e.name === 'player' && e.username === 'alpha') ||
                    bot.players.alpha?.entity;

if (alphaEntity && lib.count('stone_sword') >= 2) {
  console.log(`Alpha detected at ${lib.fmt(alphaEntity.position)}! Sharing stone sword...`);
  try {
    await bot.lookAt(alphaEntity.position.offset(0, alphaEntity.height * 0.8, 0));
    await bot.toss(mcData.itemsByName.stone_sword.id, null, 1);
    bot.chat('gamma: Alpha take this stone sword!');
    await sleep(600);
  } catch (e) {
    console.log('Toss sword note:', e.message);
  }
}

// 2. Ensure best weapon equipped
await lib.equipWeapon();

// 3. Step forward to frontline battlements at (34, 67, -188)
console.log('Stepping to frontline battlements (34, 67, -188)...');
try {
  await lib.goTo(34, 67, -188, 1, { timeoutMs: 4000 });
} catch (e) {
  try { await lib.goToXZ(34, -188, { timeoutMs: 3000 }); } catch (e2) {}
}

console.log('Combat position:', lib.fmt(bot.entity.position));

// 4. Ensure protective wall is solid at (34, 67, -189)
const wallSpot = new Vec3(34, 67, -189);
const wb = bot.blockAt(wallSpot);
if (!wb || wb.name === 'air') {
  if (lib.count('cobblestone') > 0) {
    try {
      await lib.place('cobblestone', wallSpot.x, wallSpot.y, wallSpot.z);
      console.log('Placed frontline wall block!');
    } catch (e) {}
  }
}

// 5. Combat loop against Blazes
const combatEnd = Date.now() + 40000;
let initialRods = lib.count('blaze_rod');

while (Date.now() < combatEnd && !isCancelled()) {
  if (bot.health <= 6) {
    console.log('Health critical (', bot.health, ') - falling back behind blast wall at (44, 65, -169)!');
    try { await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 5000 }); } catch (e) {}
    break;
  }

  // Find nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e && e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 5.0)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  if (blazes.length > 0) {
    const target = blazes[0];
    const dist = target.position.distanceTo(bot.entity.position);
    console.log(`Striking Blaze at ${lib.fmt(target.position)} (dist ${dist.toFixed(1)}m)...`);

    await bot.lookAt(target.position.offset(0, target.height * 0.5, 0));
    bot.attack(target);
    await sleep(550);
    await lib.pickup(5);
  } else {
    await lib.pickup(5);
    await sleep(600);
  }

  const currentRods = lib.count('blaze_rod');
  if (currentRods > initialRods) {
    console.log(`*** BLAZE ROD HARVESTED! Total: ${currentRods} ***`);
    bot.chat(`gamma: harvested Blaze Rod! Total: ${currentRods}`);
    initialRods = currentRods;
  }
}

console.log('Round ended. Blaze rods:', lib.count('blaze_rod'), 'HP:', bot.health);
console.log('Final status:', JSON.stringify(lib.status()));
