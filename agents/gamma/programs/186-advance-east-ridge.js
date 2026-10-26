// programs/186-advance-east-ridge.js
console.log('--- ADVANCE ALONG SAFE EAST RIDGE TO FORTRESS WORKSHOP ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// Equip weapon
await lib.equipWeapon();

// Check other players
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username) {
    const ent = p.entity;
    console.log(`Teammate ${p.username}: ${ent ? `${lib.fmt(ent.position)} (dist: ${bot.entity.position.distanceTo(ent.position).toFixed(1)}m)` : 'offline/far'}`);
  }
}

bot.chat('gamma marching along Safe East Ridge trail to Fortress Workshop (44, 65, -127)...');

// Safe East Ridge Waypoints from team/notes.md (NEVER route west of x=60 before z=-100)
const safeWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -141)
];

for (let i = 0; i < safeWaypoints.length; i++) {
  const wp = safeWaypoints[i];
  console.log(`Navigating to WP ${i + 1}: ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(1)}m)...`);
  
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 25000 });
    console.log(`Reached WP ${i + 1} at ${lib.fmt(bot.entity.position)}!`);
  } catch (e) {
    console.log(`WP ${i + 1} goTo note: ${e.message}`);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 15000 });
      console.log(`Reached WP ${i + 1} via goToXZ at ${lib.fmt(bot.entity.position)}!`);
    } catch (e2) {
      console.log(`WP ${i + 1} goToXZ note: ${e2.message}`);
    }
  }

  // Check health and hostiles
  if (bot.health <= 10) {
    console.log('WARNING: Health low! HP:', bot.health);
  }
}

console.log('Pos after trail advance:', lib.fmt(bot.entity.position));
console.log('Final HP:', bot.health, 'Food:', bot.food);
console.log('Final inv:', JSON.stringify(lib.inv()));

// Check teammates nearby at destination
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username} near us at: ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
  }
}

bot.chat(`gamma reached Fortress Advance Tunnel at ${lib.fmt(bot.entity.position)}! Ready to tunnel to Blaze Spawner (32, 68, -190).`);
