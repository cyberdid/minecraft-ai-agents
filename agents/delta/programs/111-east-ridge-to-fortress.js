// programs/111-east-ridge-to-fortress.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

await lib.equipWeapon();

// The proven East Ridge Trail from team notes:
// (63, 64, -5) -> (62, 66, -30) -> (61, 67, -59) -> (54, 65, -90) -> (44, 66, -128)
const ridgeWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -128)
];

bot.chat('delta: Following East Ridge Trail (x=62..63) directly to Fortress Workshop (44, 66, -128)!');

for (const wp of ridgeWaypoints) {
  console.log(`Advancing to ridge waypoint ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached ${lib.fmt(wp)}! Pos now: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Path note at ${lib.fmt(wp)}:`, err.message);
  }

  // Quick check for hostiles
  const hostiles = lib.hostiles(12);
  for (const h of hostiles) {
    if (h.dist < 5 && !['zombified_piglin'].includes(h.name)) {
      console.log(`Defending against ${h.name} at dist ${h.dist}...`);
      try {
        await lib.fight(6, 6);
      } catch (e) {}
    }
  }

  // Check teammates
  for (const [name, p] of Object.entries(bot.players)) {
    if (p && p.entity && name !== 'delta') {
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      if (d < 25) {
        console.log(`Teammate ${name} nearby at ${lib.fmt(p.entity.position)} (dist ${d})`);
      }
    }
  }
}

console.log('Final position:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

if (bot.entity.position.z <= -110) {
  bot.chat(`delta: Reached Fortress Workshop at ${lib.fmt(bot.entity.position)}! United with Alpha and Beta.`);
}
