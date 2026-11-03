// programs/409-enter-portal-from-inside-base.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Enter base shelter at (294, 72, -56)
console.log('Walking inside base shelter...');
try {
  await lib.goTo(294, 72, -56, 1, { timeoutMs: 8000 });
} catch (e) {
  console.log('goTo base note:', e.message);
  await lib.goThroughDoor(297, 72, -56);
}

console.log('Inside base pos:', lib.fmt(bot.entity.position));

// 2. Walk directly into portal block at (299.5, 73.0, -54.0) from inside base
console.log('Stepping into portal block at (299.5, 73.0, -54.0)...');
await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
bot.setControlState('forward', true);
await sleep(1500);
bot.setControlState('forward', false);

console.log('Pos inside portal block:', lib.fmt(bot.entity.position));

// 3. Await Nether dimension transition
console.log('Awaiting Nether teleportation...');
const portalStart = Date.now();
while (!isCancelled() && bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 15000) {
  await sleep(400);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  console.log('Portal transit failed.');
  return;
}

bot.chat('delta: In Nether! Fast-marching along covered corridor to Spawner Pillbox!');

// 4. Safe exit bunker towards x=46, z=-7
await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

// 5. Extinguish any fire / soul_fire along trail
async function extinguishNearbyFire() {
  const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
  if (fireIds.length === 0) return;
  const fires = bot.findBlocks({ matching: fireIds, maxDistance: 8, count: 10 });
  for (const fPos of fires) {
    const b = bot.blockAt(fPos);
    if (b && (b.name === 'fire' || b.name === 'soul_fire')) {
      try { await bot.dig(b); } catch (e) {}
    }
  }
}

await extinguishNearbyFire();

// 6. Fast march safe waypoints to Spawner Pillbox
const waypoints = [
  new Vec3(46, 65, -7),
  new Vec3(54, 65, -7),
  new Vec3(63, 64, -7),   // Tunnel entrance
  new Vec3(63, 65, -20),  // Inside tunnel
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127), // Fortress Workshop Outpost
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -163),
  new Vec3(44, 65, -174), // Spawner Bridgehead
  new Vec3(37, 65, -177), // Cross-bridge corner
  new Vec3(36, 66, -185)  // Spawner Pillbox cover spot
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  
  await extinguishNearbyFire();
  
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 8000 });
  } catch (err) {
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 1, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
  }
}

console.log('Arrived at Spawner Pillbox! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 7. Equip stone sword and pick up drops
try {
  const p = await lib.pickup(5);
  if (p > 0) console.log(`Picked up ${p} items!`);
} catch (e) {}

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// 8. Tactical Blaze combat loop from stationary cover
console.log('Engaging Blazes with team...');
const combatStart = Date.now();
let lastAttack = 0;
let killed = 0;

while (!isCancelled() && Date.now() - combatStart < 45000) {
  if (bot.health < 10) {
    console.log(`HP low (${bot.health}/20). Taking cover behind solid pillbox wall...`);
    try { await lib.goTo(37, 65, -178, 1, { timeoutMs: 3000 }); } catch (e) {}
    await sleep(4000);
    try { await lib.goTo(36, 66, -185, 1, { timeoutMs: 3000 }); } catch (e) {}
    continue;
  }
  
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && e.health > 0)
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  
  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    if (dist <= 4.2 && Date.now() - lastAttack > 650) {
      await bot.lookAt(target.position.offset(0, target.height * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      console.log(`Attacked Blaze at dist ${dist.toFixed(1)}m (Blaze HP: ${target.health})`);
      if (target.health <= 0) {
        killed++;
        console.log(`Blaze eliminated! Total: ${killed}`);
      }
    }
  }
  
  if (Math.random() < 0.2) {
    try { await lib.pickup(4); } catch (e) {}
  }
  
  await sleep(150);
}

try { await lib.pickup(5); } catch (e) {}

const currentRods = lib.count('blaze_rod');
console.log(`Combat round complete. Rods in hand: ${currentRods}, HP: ${bot.health}/20`);
bot.chat(`delta: Spawner engagement round complete! Rods in hand: ${currentRods}, HP: ${bot.health}/20`);
