// programs/393-transit-and-join-pillbox-team.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Ensure standing firmly inside portal block at (298.5, 73.0, -54.0)
if (bot.game.dimension === 'overworld') {
  console.log('Stepping firmly into portal block...');
  await bot.lookAt(new Vec3(298.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);
  
  // Await Nether dimension transition
  console.log('Awaiting Nether dimension transition (portal warping)...');
  const portalStart = Date.now();
  while (!isCancelled() && bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 25000) {
    await sleep(400);
  }
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  console.log('Portal transit did not complete.');
  return;
}

bot.chat('delta: In Nether with stone_sword & 8 cobble! Uniting with Alpha & Beta at Spawner Pillbox!');

// 2. Extinguish any nearby fire / soul_fire along trail
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

// 3. Safe exit bunker towards x=46, z=-7
await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

// 4. Safe trail waypoints to Spawner Pillbox
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
  new Vec3(37, 65, -177), // Cross-bridge under roof
  new Vec3(36, 66, -183)  // Pillbox stationary combat spot
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

console.log('Arrived at Spawner Pillbox with team! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 5. Equip stone sword
try { await lib.pickup(4); } catch (e) {}
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// 6. Tactical hit-and-heal Blaze combat loop
console.log('Engaging Blazes through firing slit...');
const combatStart = Date.now();
let lastAttack = 0;
let killed = 0;

while (!isCancelled() && Date.now() - combatStart < 45000) {
  // If health drops below 12, step back under roof to regenerate
  if (bot.health < 12) {
    console.log(`HP low (${bot.health}/20). Stepping back to (38, 65, -177) to heal...`);
    try { await lib.goTo(38, 65, -177, 1, { timeoutMs: 3000 }); } catch (e) {}
    await sleep(4000);
    try { await lib.goTo(36, 66, -183, 1, { timeoutMs: 3000 }); } catch (e) {}
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
