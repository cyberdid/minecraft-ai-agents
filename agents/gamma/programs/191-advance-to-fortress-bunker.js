// programs/191-advance-to-fortress-bunker.js
console.log('--- ADVANCE TO FORTRESS WORKSHOP & JOIN BETA ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// Equip stone sword
await lib.equipWeapon();

bot.chat('gamma turning West from z=-100 to Fortress Workshop (44, 65, -127)...');

// Waypoints to Fortress Workshop
const waypoints = [
  new Vec3(56, 65, -108),
  new Vec3(50, 65, -115),
  new Vec3(46, 65, -122),
  new Vec3(44, 65, -127), // Fortress Workshop Bunker entrance
  new Vec3(44, 65, -135), // Covered tunnel
  new Vec3(44, 65, -141)  // Covered tunnel
];

for (let i = 0; i < waypoints.length; i++) {
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}: ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(1)}m)...`);
  
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 15000 });
    console.log(`Reached WP ${i + 1} at ${lib.fmt(bot.entity.position)}!`);
  } catch (e) {
    console.log(`WP ${i + 1} goTo note: ${e.message}`);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 12000 });
      console.log(`Reached WP ${i + 1} via goToXZ at ${lib.fmt(bot.entity.position)}!`);
    } catch (e2) {
      console.log(`WP ${i + 1} goToXZ note: ${e2.message}`);
    }
  }
}

console.log('Pos at advance tunnel:', lib.fmt(bot.entity.position));

// Check teammates nearby
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username} near us at: ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
  }
}

bot.chat(`gamma safely reached Fortress Workshop / Advance Tunnel ${lib.fmt(bot.entity.position)}! Ready to breach mountain with Beta.`);
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
