// programs/507-fire-safe-ridge-to-fortress.js
console.log('=== Step: Fire-Safe East Ridge March to Fortress Tunnel ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Helper: Extinguish all fire within range
async function extinguishNearbyFire(range = 5) {
  const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
  const fires = bot.findBlocks({
    matching: fireIds,
    maxDistance: range,
    count: 10
  });
  for (const fp of fires) {
    try {
      console.log(`Extinguishing fire at ${lib.fmt(fp)}...`);
      await lib.dig(fp.x, fp.y, fp.z);
    } catch (e) {}
  }
}

// 1. Step out of portal
bot.setControlState('forward', true);
await sleep(800);
bot.clearControlStates();
console.log('Outside portal at', lib.fmt(bot.entity.position));

// 2. Check bunker chest
const chestPos = bot.findBlocks({ matching: mcData.blocksByName.chest?.id, maxDistance: 6, count: 1 })[0];
if (chestPos) {
  try {
    const cb = bot.blockAt(chestPos);
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Bunker chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
    for (const it of items) {
      if (it.name.endsWith('_pickaxe') || it.name.endsWith('_sword') || it.name === 'cobblestone' || it.name.startsWith('cooked_')) {
        await chest.withdraw(it.type, null, it.count);
        console.log(`Withdrew ${it.name}x${it.count}!`);
      }
    }
    chest.close();
  } catch (e) {}
}

try { await lib.equipArmor(); } catch (e) {}

// 3. Safe East Ridge Waypoints
const waypoints = [
  new Vec3(63, 65, -7),
  new Vec3(63, 65, -35),
  new Vec3(62, 66, -60),
  new Vec3(62, 65, -95),
  new Vec3(50, 65, -120),
  new Vec3(45, 65, -127),
  new Vec3(44, 65, -132)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i+1}/${waypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);
  
  // Extinguish fire around current pos before moving
  await extinguishNearbyFire(5);
  
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0);
    console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i+1} path error, using walkTo:`, e.message);
    try { await lib.walkTo(wp.x, wp.z); } catch (e2) {}
  }
  
  // Extinguish fire at new position
  await extinguishNearbyFire(5);
}

console.log('Final position:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Check Alpha, Delta, Gamma
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

bot.chat(`beta: United at Fortress advance hallway (${lib.fmt(bot.entity.position)})! Team ready to tunnel to Blaze Spawner at (32, 68, -190)!`);
