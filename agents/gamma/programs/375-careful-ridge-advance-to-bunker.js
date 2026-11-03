// programs/375-careful-ridge-advance-to-bunker.js
console.log('=== ULTRA-CAREFUL ADVANCE TO FORTRESS WORKSHOP BUNKER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Offhand shield check
if (bot.inventory.slots[45]?.name !== 'shield') {
  try {
    const s = bot.inventory.items().find(i => i.name === 'shield');
    if (s) await bot.equip(s, 'off-hand');
  } catch (e) {}
}
await lib.equipWeapon();

// Strict movements configuration
if (typeof configureFireAvoidance === 'function') {
  configureFireAvoidance();
}

async function clearFire() {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 8,
    count: 12
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b && (b.name === 'fire' || b.name === 'soul_fire')) {
        await bot.dig(b);
      }
    } catch (e) {}
  }
}

await clearFire();

// Ridge waypoints to bunker
const waypoints = [
  new Vec3(62.0, 66.0, -70.0),
  new Vec3(62.0, 66.0, -80.0),
  new Vec3(61.0, 66.0, -100.0),
  new Vec3(50.0, 65.0, -115.0),
  new Vec3(44.0, 65.0, -127.0),
  new Vec3(44.0, 65.0, -129.0)
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`Advancing to ${lib.fmt(wp)}...`);
  await clearFire();

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.2, { timeoutMs: 12000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 10000 });
    } catch (e2) {
      console.log(`Navigation to ${lib.fmt(wp)} note:`, e2.message);
    }
  }

  await clearFire();
  try { await lib.pickup(4); } catch (e) {}
}

console.log('Arrived! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
if (bot.entity.position.distanceTo(new Vec3(44, 65, -129)) < 4) {
  console.log('Successfully inside Fortress Workshop Bunker!');
  bot.chat('gamma: safely inside Fortress Workshop Bunker at (44, 65, -129)!');
}
console.log('Status:', JSON.stringify(lib.status()));
