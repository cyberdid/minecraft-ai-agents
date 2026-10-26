// programs/167-waypoint-rush-base-or-shelter.js
console.log('--- WAYPOINT RUSH TO BASE OR SHELTER ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Reset any stuck pathfinder
bot.pathfinder.setGoal(null);
bot.clearControlStates();

const waypoints = [
  new Vec3(185, 65, -95),
  new Vec3(215, 67, -85),
  new Vec3(245, 70, -75),
  new Vec3(275, 71, -65),
  new Vec3(294, 72, -53)
];

for (let i = 0; i < waypoints.length; i++) {
  const wp = waypoints[i];
  if (lib.time().secondsUntilNight < 25 && bot.entity.position.distanceTo(new Vec3(294, 72, -53)) > 15) {
    console.log(`Night imminent (${lib.time().secondsUntilNight}s left) and too far from base! Sheltering now.`);
    break;
  }
  console.log(`Running to WP ${i + 1}: ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(1)}m)...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 10000 });
  } catch (e) {
    console.log(`WP ${i + 1} note: ${e.message}`);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 });
    } catch (e2) {
      console.log(`WP ${i + 1} goToXZ note: ${e2.message}`);
    }
  }
}

const baseDoor = new Vec3(294, 72, -54);
const distToBase = bot.entity.position.distanceTo(baseDoor);
console.log('Distance to base door:', distToBase.toFixed(1));

if (distToBase <= 8) {
  console.log('At base! Entering through door...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    console.log('Inside base!');
  } catch (e) {
    console.log('Door note:', e.message);
    try { await lib.goTo(293, 72, -56, 1); } catch (e2) {}
  }

  try { await lib.door(294, 72, -54, false); } catch (e) {}

  bot.chat('Gamma is inside base with team! Ready to sleep at 12542.');
  
  // Set spawn and sleep
  try { await lib.setSpawn(); } catch (e) {}
  
  while (bot.time.timeOfDay < 12542 && !isCancelled()) {
    await sleep(500);
  }
  
  try {
    await lib.sleepInBed();
    console.log('SLEPT IN BED!');
    bot.chat('Gamma is in bed! Night skipped.');
  } catch (e) {
    console.log('sleepInBed note:', e.message);
  }
} else {
  console.log(`Outdoors at nightfall! Position: ${lib.fmt(bot.entity.position)}. Sheltering immediately...`);
  try {
    await lib.shelter();
    console.log('Sheltered safely! Pos:', lib.fmt(bot.entity.position));
    bot.chat(`Gamma sheltered safely at ${lib.fmt(bot.entity.position)} for the night.`);
  } catch (e) {
    console.log('Shelter error:', e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final time:', JSON.stringify(lib.time()));
console.log('Final health:', bot.health, 'Food:', bot.food);
