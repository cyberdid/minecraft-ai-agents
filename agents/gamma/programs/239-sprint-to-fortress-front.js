// programs/239-sprint-to-fortress-front.js
console.log('=== SPRINT TO FORTRESS FRONT ALONG SAFE EAST RIDGE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food, 'Cobblestone:', lib.count('cobblestone'));

// Equip weapon for defense
await lib.equipWeapon();

bot.chat('gamma marching along Safe East Ridge to Fortress Front at (44, 65, -170) with 38 cobble!');

// Safe waypoints along x=61..63 (never route west of x=60 before z=-100)
const waypoints = [
  { name: 'WP1 (East Ridge Head)', pos: new Vec3(63, 64, -5) },
  { name: 'WP2 (Mid Ridge 1)', pos: new Vec3(62, 66, -30) },
  { name: 'WP3 (Mid Ridge 2)', pos: new Vec3(61, 67, -59) },
  { name: 'WP4 (Mid Ridge 3)', pos: new Vec3(62, 67, -80) },
  { name: 'WP5 (Turn North-West)', pos: new Vec3(61, 66, -100) },
  { name: 'WP6 (Approach Workshop)', pos: new Vec3(50, 65, -115) },
  { name: 'WP7 (Workshop Bunker)', pos: new Vec3(44, 65, -127) },
  { name: 'WP8 (Covered Advance)', pos: new Vec3(44, 65, -141) },
  { name: 'WP9 (Tunnel Front Line)', pos: new Vec3(44, 65, -170) }
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`\nNavigating to ${wp.name}: ${lib.fmt(wp.pos)} (dist: ${bot.entity.position.distanceTo(wp.pos).toFixed(1)}m)...`);
  
  try {
    await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 2, { timeoutMs: 20000 });
    console.log(`Reached ${wp.name} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`goTo note: ${e.message}`);
    try {
      await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 12000 });
      console.log(`Reached ${wp.name} via goToXZ at ${lib.fmt(bot.entity.position)}`);
    } catch (e2) {
      console.log(`goToXZ note: ${e2.message}`);
    }
  }

  // Check hostiles
  const hostiles = lib.hostiles(12);
  if (hostiles.length > 0) {
    console.log(`Warning: Hostiles near ${wp.name}:`, JSON.stringify(hostiles));
  }
}

console.log('\n=== MARCH COMPLETE ===');
console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));

// Check teammates
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username) {
    const ent = p.entity;
    console.log(`Teammate ${p.username}: ${ent ? `${lib.fmt(ent.position)} (dist: ${bot.entity.position.distanceTo(ent.position).toFixed(1)}m)` : 'offline/far'}`);
  }
}

bot.chat(`gamma at ${lib.fmt(bot.entity.position)} with 38 cobble! Ready to bridge floor to mountain!`);
