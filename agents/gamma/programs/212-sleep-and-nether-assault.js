// programs/212-sleep-and-nether-assault.js
console.log('--- SLEEP THROUGH NIGHT & SPRINT TO BLAZE FRONT ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Wait for sleep time (12542)
console.log('Waiting for sleep time (12542)...');
bot.chat('Gamma inside base with Alpha! Waiting to sleep at 12542 to skip night.');

while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  await sleep(400);
}

// 2. Sleep in bed
console.log('Sleeping in bed...');
try {
  await lib.sleepInBed();
  console.log('SLEPT IN BED!');
  bot.chat('Gamma slept in bed! Dawn reached.');
} catch (e) {
  console.log('Sleep note:', e.message);
}

console.log('Time after sleep:', JSON.stringify(lib.time()));

// 3. Exit base door to surface
console.log('Exiting base door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    const d = bot.blockAt(new Vec3(294, 72, -54));
    if (d) await bot.activateBlock(d);
    await lib.walkTo(294.5, -52.0, 2000);
  } catch (e2) {}
}

// 4. Walk south path to Overworld Nether portal (299.5, 73.0, -53.5)
console.log('Walking south path to portal...');
await lib.walkTo(294.5, -52.0, 2000);
await lib.walkTo(299.5, -52.0, 3000);
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.setControlState('jump', false);
bot.clearControlStates();

console.log('Inside portal frame! Pos:', bot.entity.position);

// 5. Stand still for 4s transit
console.log('Waiting for transit to Nether...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting in portal... dim=${bot.game.dimension}`);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within deadline');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));

// 6. Step out to bunker floor (40.5, 65, -5.0)
await lib.walkTo(40.5, -5.0, 3000);
bot.clearControlStates();

bot.chat(`gamma arrived in Nether bunker ${lib.fmt(bot.entity.position)}! Sprinting through covered tunnel to Delta & Alpha at (44, 65, -157).`);

// 7. Sprint through covered East Ridge tunnel to Delta at (44, 65, -157)
const waypoints = [
  new Vec3(63, 65, -3),
  new Vec3(63, 65, -30),
  new Vec3(62, 65, -60),
  new Vec3(62, 65, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -140),
  new Vec3(44, 65, -155),
  new Vec3(44, 65, -157)
];

for (let i = 0; i < waypoints.length; i++) {
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 15000 });
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 10000 }); } catch (e2) {}
  }
}

console.log('Final pos at Blaze battlements front:', lib.fmt(bot.entity.position));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma joined Delta at Blaze battlements front ${lib.fmt(bot.entity.position)}! United to farm Blaze Rods!`);
