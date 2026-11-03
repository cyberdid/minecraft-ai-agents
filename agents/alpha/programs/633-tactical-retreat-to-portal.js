// programs/633-tactical-retreat-to-portal.js
console.log('=== Program 633: Tactical Retreat to Nether Portal ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

bot.chat(`alpha: HP critical (${bot.health.toFixed(1)}/20, no food)! Executing tactical retreat along covered corridor to Portal Camp!`);

const reverseWaypoints = [
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
  new Vec3(63, 65, -20),  // Soul sand tunnel
  new Vec3(63, 64, -7),
  new Vec3(54, 65, -7),
  new Vec3(46, 65, -7),
  new Vec3(40, 65, -7)   // Nether Portal Bunker!
];

for (let i = 0; i < reverseWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = reverseWaypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  
  console.log(`Retreat WP ${i + 1}/${reverseWaypoints.length}: ${lib.fmt(wp)} (pos: ${lib.fmt(bot.entity.position)})`);
  // Keep gaze low to avoid Endermen
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 8000 });
  } catch (err) {
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1000);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
}

console.log('Arrived at Nether Portal Camp! Pos:', lib.fmt(bot.entity.position));

// Step into Nether Portal block at (40, 65, -7) to warp to Overworld
const portalBlock = bot.findBlock({ matching: b => b.name === 'nether_portal', maxDistance: 8 });
if (portalBlock) {
  console.log('Entering Nether Portal block at', lib.fmt(portalBlock.position));
  await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
  
  // Await Overworld warp
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Dimension after retreat:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// If in Overworld, enter base and sleep in bed to restore full HP & food!
if (bot.game.dimension === 'overworld') {
  bot.chat('alpha: In Overworld! Entering base shelter to sleep and restore full 20 HP & food!');
  try {
    await lib.goTo(293, 72, -55, 1, { timeoutMs: 10000 });
    await lib.setSpawn();
    const bed = bot.findBlock({ matching: b => b.name.includes('bed'), maxDistance: 5 });
    if (bed) {
      console.log('Found bed at', lib.fmt(bed.position));
      if (lib.time().canSleep || lib.time().night) {
        await lib.sleepInBed();
        console.log('Slept in bed! HP & food fully restored!');
      }
    }
  } catch (e) {
    console.log('Base note:', e.message);
  }
}

console.log('Alpha status:', lib.status());
bot.chat(`alpha: Tactical retreat complete! Dimension: ${bot.game.dimension}, HP: ${bot.health.toFixed(1)}/20, Food: ${bot.food}/20`);
