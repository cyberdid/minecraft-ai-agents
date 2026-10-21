// programs/123-stepwise-return.js
// Return to base in 40-block legs: from (153, -5) to (294, -52)

console.log('alpha at:', lib.fmt(bot.entity.position), '| night in:', lib.time().secondsUntilNight);

const waypoints = [
  new Vec3(190, 64, -20),
  new Vec3(230, 66, -35),
  new Vec3(270, 70, -45),
  new Vec3(294, 72, -52)
];

for (const wp of waypoints) {
  console.log(`Walking to waypoint ${lib.fmt(wp)}...`);
  try {
    await lib.goToXZ(wp.x, wp.z);
    console.log(`Reached waypoint! Alpha now at: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Waypoint ${lib.fmt(wp)} note:`, e.message);
  }
}

// Enter base
console.log('Entering base...');
try {
  await passDoorIn();
  console.log('Inside base! Alpha at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door in note:', e.message);
}

bot.chat('alpha: Safely arrived back inside base with you beta!');
console.log('Alpha at destination:', lib.fmt(bot.entity.position));
