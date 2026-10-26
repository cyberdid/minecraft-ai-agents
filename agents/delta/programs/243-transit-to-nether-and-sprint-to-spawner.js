// programs/243-transit-to-nether-and-sprint-to-spawner.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.pathfinder.stop();
await sleep(200);

// 1. Step into nether portal block at (299.5, 73.0, -54.0)
if (bot.game.dimension !== 'the_nether') {
  console.log('Stepping into nether portal block at (299.5, 73.0, -54.0)...');
  bot.chat('delta: Stepping into Nether portal block at (299, 73, -54)!');
  
  // Set position directly into the portal
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
  
  // Wait for dimension change
  console.log('Waiting for dimension transition...');
  const start = Date.now();
  while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
    await sleep(500);
  }
}

console.log('Current dim:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  throw new Error('Failed to transit into the_nether');
}

bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Sprinting to Spawner front!`);

// 2. Follow waypoints through enclosed tunnel to Alpha at (44, 65, -172)
const waypoints = [
  new Vec3(40, 65, -7),
  new Vec3(63, 64, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -163),
  new Vec3(44, 65, -172)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  // If we are already past or near this waypoint, proceed
  if (bot.entity.position.distanceTo(wp) > 4) {
    console.log(`Heading to waypoint ${lib.fmt(wp)}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    } catch (e) {
      console.log(`Path note to ${lib.fmt(wp)}:`, e.message);
    }
  }
}

console.log('Reached front at:', lib.fmt(bot.entity.position));

// 3. Check players nearby
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && bot.entity.position.distanceTo(p.entity.position) < 15) {
    console.log(`Player ${name} is at ${lib.fmt(p.entity.position)}`);
  }
}

// 4. If Alpha is nearby, drop a stone sword for them
const alpha = bot.players.alpha?.entity;
if (alpha && bot.entity.position.distanceTo(alpha.position) < 5 && lib.count('stone_sword') > 1) {
  console.log('Sharing stone_sword with Alpha...');
  await bot.lookAt(alpha.position.offset(0, 1, 0), true);
  await bot.toss(mcData.itemsByName.stone_sword.id, null, 1);
  bot.chat('delta: Alpha, tossed you a stone_sword! Let us take the Blaze Spawner!');
}

bot.chat(`delta: United at Spawner front ${lib.fmt(bot.entity.position)}! Building bridge to Balcony!`);
