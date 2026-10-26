// programs/110-advance-to-fortress-workshop.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

await lib.equipWeapon();

const waypoints = [
  new Vec3(45, 65, -50),
  new Vec3(45, 65, -80),
  new Vec3(44, 65, -110),
  new Vec3(44, 65, -129)
];

bot.chat('delta: Advancing North along x=44 ridge to relieve Beta at Fortress Workshop (44, 65, -129)!');

for (const wp of waypoints) {
  console.log(`Heading to waypoint ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached waypoint ${lib.fmt(wp)}! Pos now: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Waypoint ${lib.fmt(wp)} path note:`, err.message);
  }

  // Defend against any close hostile mobs
  const hostiles = lib.hostiles(12);
  for (const h of hostiles) {
    if (h.dist < 5 && !['zombified_piglin'].includes(h.name)) {
      console.log(`Engaging ${h.name} at dist ${h.dist}...`);
      try {
        await lib.fight(6, 8);
      } catch (e) {}
    }
  }

  // Check if Beta is nearby
  for (const [name, p] of Object.entries(bot.players)) {
    if (p && p.entity && name !== 'delta') {
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      if (d < 25) {
        console.log(`Teammate ${name} nearby at ${lib.fmt(p.entity.position)} (dist ${d})`);
      }
    }
  }
}

console.log('Arrived at final position:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

if (bot.entity.position.z <= -120) {
  bot.chat(`delta: Reached Fortress Workshop ${lib.fmt(bot.entity.position)}! United with Beta to fortify outpost.`);
}
