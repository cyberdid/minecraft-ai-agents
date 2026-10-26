// programs/258-march-east-ridge-to-fortress.js
console.log('=== MARCH EAST RIDGE TO FORTRESS FRONT WITH SHIELD & 62 BLOCKS ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Equip Shield in offhand and Stone Sword in mainhand
await lib.equipArmor();
await lib.equipWeapon();

console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Building blocks: cobble =', lib.count('cobblestone'), 'soul_sand =', lib.count('soul_sand'));

bot.chat('gamma marching along Safe East Ridge to Fortress Front with SHIELD and 62 building blocks!');

// Safe waypoints strictly on x=61..63 until z=-100
const trailWaypoints = [
  { name: 'WP2 (Mid Ridge 1)', x: 62, y: 66, z: -30 },
  { name: 'WP3 (Mid Ridge 2)', x: 61, y: 67, z: -59 },
  { name: 'WP4 (Mid Ridge 3)', x: 62, y: 67, z: -80 },
  { name: 'WP5 (Turn North-West)', x: 61, y: 66, z: -100 },
  { name: 'WP6 (Approach Workshop)', x: 50, y: 65, z: -115 },
  { name: 'WP7 (Fortress Workshop Bunker)', x: 44, y: 65, z: -127 },
  { name: 'WP8 (Covered Advance)', x: 44, y: 65, z: -141 },
  { name: 'WP9 (Front Line)', x: 44, y: 65, z: -170 }
];

for (let i = 0; i < trailWaypoints.length && !isCancelled(); i++) {
  const wp = trailWaypoints[i];
  console.log(`\nAdvancing to ${wp.name}: (${wp.x}, ${wp.y}, ${wp.z}) (dist: ${bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)).toFixed(1)}m)...`);

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 25000 });
    console.log(`Reached ${wp.name} at ${lib.fmt(bot.entity.position)}!`);
  } catch (e) {
    console.log(`goTo note for ${wp.name}: ${e.message}`);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 15000 });
      console.log(`Reached ${wp.name} via goToXZ at ${lib.fmt(bot.entity.position)}!`);
    } catch (e2) {
      console.log(`goToXZ note for ${wp.name}: ${e2.message}`);
    }
  }

  // Check hostiles
  const hostiles = lib.hostiles(16);
  if (hostiles.length > 0) {
    console.log(`Hostiles near ${wp.name} (${hostiles.length}):`, hostiles.map(h => `${h.name} at dist ${h.dist.toFixed(1)}m`));
  }

  // Check health
  if (bot.health <= 6) {
    console.log('CRITICAL HEALTH WARNING: HP =', bot.health);
  }
}

console.log('\n=== MARCH RESULT ===');
console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Blocks: cobble =', lib.count('cobblestone'), 'soul_sand =', lib.count('soul_sand'));

// Distance to Blaze Spawner at (32, 68, -190)
const spawnerDist = bot.entity.position.distanceTo(new Vec3(32, 68, -190)).toFixed(1);
console.log(`Distance to Blaze Spawner (32, 68, -190): ${spawnerDist}m`);

bot.chat(`gamma at ${lib.fmt(bot.entity.position)}! Shield in offhand, 60+ blocks. Only ${spawnerDist}m to Blaze Spawner!`);
