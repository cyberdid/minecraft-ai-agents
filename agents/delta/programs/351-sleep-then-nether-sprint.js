// programs/351-sleep-then-nether-sprint.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'time:', bot.time.timeOfDay);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Check time - if dusk/night (>= 12000), sleep in Bed 2 to skip night
const t = bot.time.timeOfDay;
console.log(`Current time: ${t}`);
if (t >= 11800 && t <= 23500) {
  console.log('Night is arriving! Going to Bed 2 at (293, 72, -56) to skip night...');
  try {
    await lib.goTo(294, 72, -56, 1, { timeoutMs: 8000 });
  } catch (e) {}

  while (!isCancelled() && bot.time.timeOfDay < 12542) {
    console.log(`Waiting for sleep tick 12542 (now ${bot.time.timeOfDay})...`);
    await sleep(1000);
  }

  const bed = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 6, count: 1 })[0];
  if (bed) {
    console.log(`Found bed at ${lib.fmt(bed)}! Sleeping...`);
    try {
      await bot.sleep(bot.blockAt(bed));
      bot.chat('delta: Sleeping in Bed 2 to skip night!');
      await sleep(5000);
      try { await bot.wake(); } catch (e) {}
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
}

console.log('Time after sleep check:', bot.time.timeOfDay, 'pos:', lib.fmt(bot.entity.position));

// 2. Step onto portal frame at (299.5, 73.0, -54.0)
console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299, 72, -55, 1, { timeoutMs: 6000 });
} catch (e) {}

// Jump up onto portal floor at y=73, z=-54
await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1500);
bot.clearControlStates();

console.log('Position inside portal block:', lib.fmt(bot.entity.position));

// Hold position inside portal block until dimension change
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  const portalTarget = new Vec3(299.5, 73.0, -54.0);
  if (bot.entity.position.distanceTo(portalTarget) > 0.8) {
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    await sleep(200);
    bot.clearControlStates();
  }
  await sleep(400);
}

console.log('Dimension now:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Nether transit did not occur within 15s.');
  return;
}

bot.chat(`delta: Entered Nether with off-hand SHIELD & stone weapons! Sprinting to Spawner Frontline!`);

// 3. Safe exit bunker at z = -8.0
console.log('Exiting bunker at z=-8.0...');
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();

// 4. Follow valley floor to East Ridge (63, 65, -8)
const toRidge = [
  new Vec3(48, 65, -8),
  new Vec3(56, 65, -8),
  new Vec3(63, 65, -8)
];
for (const wp of toRidge) {
  if (isCancelled()) break;
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 6000 });
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.clearControlStates();
  }
}

// 5. Sprint through covered corridor
const corridor = [
  new Vec3(63.0, 65.0, -15),
  new Vec3(63.0, 65.0, -30),
  new Vec3(62.0, 65.0, -50),
  new Vec3(62.0, 65.0, -70),
  new Vec3(62.0, 65.0, -90),
  new Vec3(61.0, 65.0, -100),
  new Vec3(50.0, 65.0, -115),
  new Vec3(44.0, 65.0, -127), // Fortress Workshop Bunker
  new Vec3(44.0, 65.0, -145), // Covered Advance Tunnel
  new Vec3(44.0, 65.0, -160),
  new Vec3(44.0, 65.0, -169), // Frontline Blast Wall
  new Vec3(38.0, 65.0, -176)  // Fortified Cross-Bridge
];

for (let i = 0; i < corridor.length && !isCancelled(); i++) {
  const wp = corridor[i];
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.2));
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1500);
    bot.clearControlStates();
  }
}

console.log('Arrived at fortified cross-bridge! Pos:', lib.fmt(bot.entity.position));

// 6. Shield check & place roof over cross-bridge at y=67
const roofSpots = [
  new Vec3(38, 67, -176),
  new Vec3(37, 67, -176),
  new Vec3(38, 67, -177),
  new Vec3(37, 67, -177)
];

for (const spot of roofSpots) {
  const b = bot.blockAt(spot);
  if (b && (b.name === 'air' || b.name === 'cave_air')) {
    const filler = lib.count('cobblestone') > 0 ? 'cobblestone' : (lib.count('andesite') > 0 ? 'andesite' : null);
    if (!filler) break;
    try {
      console.log(`Placing blast roof ${filler} at ${lib.fmt(spot)}...`);
      await lib.place(filler, spot.x, spot.y, spot.z);
    } catch (e) {
      console.log(`Roof place error at ${lib.fmt(spot)}:`, e.message);
    }
  }
}

// 7. Slay Blazes in range with stone sword
const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 6);
console.log(`Blazes in range: ${blazes.length}`);
if (blazes.length > 0) {
  const target = blazes[0];
  console.log(`Attacking Blaze at ${lib.fmt(target.position)}!`);
  await bot.lookAt(target.position.offset(0, 1, 0), true);
  await bot.attack(target);
  await sleep(600);
  await bot.attack(target);
}

// 8. Pick up dropped items (Blaze rods)
try {
  const picked = await lib.pickup(8);
  console.log('Pickup count:', picked);
} catch (e) {}

console.log('Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
console.log('Offhand:', bot.inventory.slots[45]?.name);

bot.chat(`delta: Spawner bridgehead fortified! Offhand: ${bot.inventory.slots[45]?.name || 'none'}, Rods: ${lib.count('blaze_rod')}, HP: ${bot.health}/20`);
