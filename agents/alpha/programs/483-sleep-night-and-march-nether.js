// programs/483-sleep-night-and-march-nether.js
console.log('=== Program 483: Sleep Dusk & March Nether to Spawner ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

// 1. Check time: sleep if dusk/night
let t = lib.time();
console.log(`Current time: ${t.timeOfDay}, canSleep: ${t.canSleep}, seconds until night: ${t.secondsUntilNight}`);

if (t.timeOfDay < 12542 && t.timeOfDay > 11000) {
  const waitMs = Math.max(500, (12542 - t.timeOfDay) * 50);
  console.log(`Waiting ${waitMs}ms until sleep time 12542...`);
  await sleep(Math.min(waitMs, 60000));
}

t = lib.time();
if (t.timeOfDay >= 12542 || t.canSleep) {
  console.log('Sleeping in bed to skip night...');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed! Night skipped to dawn.');
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

// 2. Step outside base
console.log('Stepping out of base door...');
try {
  await passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// 3. Move to Nether portal at (299, 73, -54)
console.log('Moving into Nether portal at (299, 73, -54)...');
try {
  await lib.goTo(299, 72, -53, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.goToXZ(299, -54); } catch (e2) {}
}

try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(800);
  bot.setControlState('jump', false);
  await sleep(400);
  bot.setControlState('forward', false);
}

bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 4. Wait for dimension transit
console.log('Waiting stationary inside portal for dimension transit...');
for (let wait = 0; wait < 25; wait++) {
  if (bot.game.dimension === 'the_nether') break;
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

// 5. If in Nether, advance along covered bridge to (44, 65, -159)
if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha entered the Nether at ${lib.fmt(bot.entity.position)}! Sprinting through covered bridge trail to join Delta at mountain breach (44, 65, -159)!`);

  const bridgeWaypoints = [
    new Vec3(63, 64, -5),
    new Vec3(63, 65, -20),
    new Vec3(63, 65, -35),
    new Vec3(62, 65, -50),
    new Vec3(61, 65, -65),
    new Vec3(54, 65, -90),
    new Vec3(44, 66, -127),
    new Vec3(44, 65, -140),
    new Vec3(44, 65, -150),
    new Vec3(44, 65, -159)
  ];

  for (const wp of bridgeWaypoints) {
    if (isCancelled()) break;
    if (bot.entity.position.z < wp.z - 3) continue;

    console.log(`Advancing to ${lib.fmt(wp)}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    } catch (err) {
      try {
        await bot.lookAt(new Vec3(wp.x, 64.0, wp.z), true);
        bot.setControlState('forward', true);
        await sleep(1000);
        bot.setControlState('forward', false);
      } catch (e2) {}
    }
  }

  const spawner = new Vec3(32, 68, -190);
  const dist = bot.entity.position.distanceTo(spawner);
  console.log('Alpha reached tunnel front:', lib.fmt(bot.entity.position));
  console.log(`Distance to Blaze Spawner: ${dist.toFixed(1)}m`);

  bot.chat(`team: Alpha arrived at Blaze Spawner front ${lib.fmt(bot.entity.position)} with stone sword & pickaxe! Partnering with Delta (32 cobble) to farm Blaze Rods!`);
}

console.log('FINAL STATUS:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
