// programs/098-advance-to-ridge-waypoint.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// Waypoints along safe ridge trail towards Gamma at (54, 64, -67)
const waypoints = [
  new Vec3(45, 65, -25),
  new Vec3(50, 65, -45),
  new Vec3(54, 64, -67)
];

bot.chat('delta: Advancing North along ridge trail towards waypoint (54, 64, -67)!');

for (const wp of waypoints) {
  console.log(`Advancing to waypoint ${lib.fmt(wp)}...`);
  
  // Equip weapon
  await lib.equipWeapon();
  await lib.equipArmor();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached waypoint ${lib.fmt(wp)}! Pos now: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Waypoint ${lib.fmt(wp)} path note:`, err.message);
  }

  // Check hostiles nearby
  const hostiles = lib.hostiles(16);
  if (hostiles.length > 0) {
    console.log('Hostiles near waypoint:', JSON.stringify(hostiles));
    // If skeleton or ghast, keep shield ready or engage if close
    for (const h of hostiles) {
      if (h.dist < 6 && ['zombified_piglin', 'piglin'].includes(h.name) === false) {
        console.log(`Defending against ${h.name} at dist ${h.dist}...`);
        try {
          await lib.fight(8, 10);
        } catch (e) {}
      }
    }
  }

  // Check players nearby
  for (const [name, p] of Object.entries(bot.players)) {
    if (p && p.entity && name !== 'delta') {
      const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
      if (d < 30) {
        console.log(`Teammate ${name} nearby at ${lib.fmt(p.entity.position)} (dist ${d})`);
      }
    }
  }
}

console.log('Arrived at final ridge position:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

bot.chat(`delta: Reached ridge waypoint ${lib.fmt(bot.entity.position)}! Linking up with Gamma and Alpha for Fortress breach.`);
