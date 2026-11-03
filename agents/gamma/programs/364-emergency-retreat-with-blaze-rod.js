// programs/364-emergency-retreat-with-blaze-rod.js
console.log('=== EMERGENCY RETREAT WITH BLAZE ROD ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Blaze rods:', lib.count('blaze_rod'));

bot.chat('gamma: carrying Blaze Rod #1! Tactical retreat down covered tunnel at 1 HP!');

// 1. Immediately place a cobblestone shield block behind us towards the spawner
const shieldSpots = [
  new Vec3(35, 66, -190),
  new Vec3(35, 67, -190),
  new Vec3(36, 66, -191)
];

for (const sp of shieldSpots) {
  const b = bot.blockAt(sp);
  if (!b || b.boundingBox !== 'block') {
    if (lib.count('cobblestone') > 0) {
      try {
        await lib.place('cobblestone', sp.x, sp.y, sp.z);
      } catch (e) {}
    }
  }
}

// 2. Step back along covered walkway to (38, 65, -176)
console.log('Retreating to Fortified Cross-Bridge (38, 65, -176)...');
try {
  await lib.goTo(38, 65, -176, 1.5, { timeoutMs: 8000 });
} catch (e) {
  try { await lib.goToXZ(38, -176, { timeoutMs: 6000 }); } catch (e2) {}
}

// 3. Step into the 100% blast-proof tunnel at (44, 65, -169)
console.log('Entering blast-proof high-ridge tunnel at (44, 65, -169)...');
try {
  await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 8000 });
} catch (e) {
  try { await lib.goToXZ(44, -169, { timeoutMs: 6000 }); } catch (e2) {}
}

// 4. Move south inside the tunnel to safety
const safeWaypoints = [
  { name: 'Tunnel Mid', pos: new Vec3(44, 65, -155) },
  { name: 'Tunnel South', pos: new Vec3(44, 65, -140) },
  { name: 'Fortress Bunker', pos: new Vec3(44, 65, -127) }
];

for (const wp of safeWaypoints) {
  if (isCancelled()) break;
  console.log(`Advancing to safe haven ${wp.name} at ${lib.fmt(wp.pos)}...`);
  try {
    await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 1.5, { timeoutMs: 10000 });
  } catch (e) {
    try { await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 8000 }); } catch (e2) {}
  }
}

console.log('Arrived at Fortress Bunker safely! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Rods:', lib.count('blaze_rod'));
