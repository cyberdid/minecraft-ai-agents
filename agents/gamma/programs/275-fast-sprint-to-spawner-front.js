// programs/275-fast-sprint-to-spawner-front.js
console.log('=== SPRINT ALONG SAFE RIDGE TO SPAWNER FRONT (37, 65, -181) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Equip best weapon
await lib.equipWeapon();
console.log('Weapon equipped:', bot.entity.equipment[0]?.name);

bot.chat('gamma sprinting along Safe East Ridge to Spawner Frontline at (37, 65, -181)!');

// 2. Strict waypoints along East Ridge to Fortress
const waypoints = [
  new Vec3(62.5, 66, -30),
  new Vec3(62.5, 66, -55),
  new Vec3(62.5, 67, -80),
  new Vec3(61.5, 66, -100),
  new Vec3(50.0, 65, -115),
  new Vec3(44.0, 65, -127), // Fortress Workshop Bunker
  new Vec3(44.0, 65, -145), // Covered Advance Tunnel
  new Vec3(44.0, 65, -169), // Frontline Blast Wall
  new Vec3(37.0, 65, -181)  // Spawner Bridgehead!
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  // Dimension Guard
  if (!String(bot.game.dimension).includes('nether')) {
    console.log('Aborting: Not in Nether!');
    return;
  }

  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}: ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(1)}m)...`);

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 15000 });
    console.log(`Reached WP ${i + 1} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 10000 });
      console.log(`Reached WP ${i + 1} via goToXZ at ${lib.fmt(bot.entity.position)}`);
    } catch (e2) {
      console.log(`goTo note for WP ${i + 1}: ${e2.message}`);
    }
  }

  // Combat check if Blazes near
  if (i >= 6) {
    const nearBlaze = bot.nearestEntity(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 6);
    if (nearBlaze) {
      console.log(`Blaze in melee range at ${lib.fmt(nearBlaze.position)}! Attacking...`);
      await bot.lookAt(nearBlaze.position);
      for (let h = 0; h < 5 && nearBlaze.isValid; h++) {
        bot.attack(nearBlaze);
        await sleep(650);
      }
      await lib.pickup(6);
    }
  }
}

console.log('\n=== ARRIVED AT BLAZE FRONT ===');
console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Blaze rods in inv:', lib.count('blaze_rod'));
console.log('Inv:', JSON.stringify(lib.inv()));

const spawnerPos = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawnerPos).toFixed(1);
console.log(`Distance to Blaze Spawner: ${dist}m`);

// Check Blazes around spawner
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 20);
console.log(`Blazes within 20m (${blazes.length}):`, blazes.map(b => `${lib.fmt(b.position)} (dist: ${bot.entity.position.distanceTo(b.position).toFixed(1)}m)`));

bot.chat(`gamma at Spawner Front (${lib.fmt(bot.entity.position)})! Dist: ${dist}m, Blazes: ${blazes.length}, Blaze Rods: ${lib.count('blaze_rod')}!`);
