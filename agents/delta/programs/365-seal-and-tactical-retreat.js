// programs/365-seal-and-tactical-retreat.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Immediately seal firing slit with 1 cobblestone to stop all incoming fireballs
const feetY = Math.floor(bot.entity.position.y);
const slitSpots = [
  new Vec3(36, feetY + 1, -186),
  new Vec3(35, feetY + 1, -185),
  new Vec3(36, feetY, -186)
];
for (const s of slitSpots) {
  const b = bot.blockAt(s);
  if (b && (b.name === 'air' || b.name === 'cave_air')) {
    try {
      await lib.place('cobblestone', s.x, s.y, s.z);
      console.log('Sealed firing slit at', lib.fmt(s));
      break;
    } catch (e) {}
  }
}

bot.chat(`delta: Tactical retreat to heal at 5 HP! Returning through covered corridor to base.`);

// 2. Sprint reverse covered trail back to Nether Portal
const returnTrail = [
  new Vec3(37, 65, -177),
  new Vec3(44, 65, -174),
  new Vec3(44, 65, -163),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -127), // Fortress Workshop Outpost
  new Vec3(50, 65, -115),
  new Vec3(61, 66, -100),
  new Vec3(62, 67, -80),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -50),
  new Vec3(63, 66, -35),
  new Vec3(63, 65, -20),
  new Vec3(63, 64, -7),
  new Vec3(54, 65, -7),
  new Vec3(46, 65, -7),
  new Vec3(40, 65, -7)   // Nether Portal bunker
];

for (let i = 0; i < returnTrail.length; i++) {
  if (isCancelled()) break;
  const wp = returnTrail[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  
  console.log(`Return WP ${i + 1}/${returnTrail.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 6000 });
  } catch (err) {
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1000);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
}

console.log('Arrived at Nether portal bunker! Pos:', lib.fmt(bot.entity.position));

// 3. Step inside Nether portal at (40.5, 65.0, -7.0)
await bot.lookAt(new Vec3(40.5, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1500);
bot.setControlState('forward', false);

console.log('Awaiting Overworld dimension change...');
const portalStart = Date.now();
while (!isCancelled() && bot.game.dimension === 'the_nether' && Date.now() - portalStart < 15000) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'overworld') {
  bot.chat(`delta: Safely returned to Overworld base! HP: ${bot.health}/20. Gathering food to heal!`);
  // Move into base
  try { await lib.goTo(294, 72, -56, 1, { timeoutMs: 8000 }); } catch (e) {}
}
