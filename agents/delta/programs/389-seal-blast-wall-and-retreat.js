// programs/389-seal-blast-wall-and-retreat.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'food:', bot.food);

// 1. Try placing a cobblestone blast block at (37, 66, -177) to seal line of sight
if (lib.count('cobblestone') > 0) {
  try {
    const target = new Vec3(37, 66, -177);
    const existing = bot.blockAt(target);
    if (existing && existing.name === 'air') {
      console.log('Placing blast wall at (37, 66, -177)...');
      await lib.place('cobblestone', target.x, target.y, target.z);
    }
  } catch (e) {
    console.log('Place blast wall note:', e.message);
  }
}

// 2. Tactical retreat to Fortress Workshop Outpost at (44, 65, -127)
console.log('Tactical retreat along covered high corridor...');
const retreatWaypoints = [
  new Vec3(44, 65, -174),
  new Vec3(44, 65, -163),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -127) // Fortified bunker outpost
];

for (const wp of retreatWaypoints) {
  if (bot.entity.position.distanceTo(wp) < 2) continue;
  console.log(`Retreating to ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { dig: false, timeoutMs: 8000 });
  } catch (e) {
    console.log(`Move note to ${lib.fmt(wp)}: ${e.message}`);
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 1, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
  }
}

console.log('Arrived at safe retreat point! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat(`delta: Tactical retreat to Fortress Outpost at (44, 65, -127)! HP: ${bot.health}/20. Meeting Gamma!`);
