// programs/366-sprint-to-base-and-secure-spawn.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'time:', bot.time.timeOfDay);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Fast sprint from spawn (183, 62, -81) to base (294, 72, -56)
console.log('Fast sprinting from world spawn to base...');
const trailToBase = [
  new Vec3(210, 63, -75),
  new Vec3(240, 65, -65),
  new Vec3(270, 68, -58),
  new Vec3(292, 72, -55),
  new Vec3(294, 72, -56)
];

for (let i = 0; i < trailToBase.length && !isCancelled(); i++) {
  const wp = trailToBase[i];
  if (bot.entity.position.distanceTo(wp) < 3) continue;
  console.log(`Heading to WP ${i + 1}/${trailToBase.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 12000 });
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(2000);
    bot.clearControlStates();
  }
}

console.log('Arrived inside base shelter! Pos:', lib.fmt(bot.entity.position));

// 2. Locate beds inside base
const beds = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 10, count: 5 });
console.log(`Found ${beds.length} beds inside base:`);
for (const b of beds) {
  console.log(`  Bed at ${lib.fmt(b)}`);
}

// Ensure spawn is permanently set
if (beds.length > 0) {
  const bedBlock = bot.blockAt(beds[0]);
  console.log(`Activating bed at ${lib.fmt(beds[0])} to lock spawn...`);
  try {
    await bot.activateBlock(bedBlock);
    await sleep(500);
    console.log('Bed activated! Spawn point set!');
    bot.chat('delta: Spawn point locked at base bed!');
  } catch (e) {
    console.log('Bed activate note:', e.message);
  }
}

// 3. Inspect base chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log(`Chest items (${items.length}):`);
    for (const i of items) {
      console.log(`  ${i.name} x${i.count}`);
      if (i.name.includes('sword') || i.name.includes('pickaxe') || i.name.includes('shield') || i.name === 'cobblestone' || i.name.includes('cooked') || i.name.includes('planks') || i.name === 'torch') {
        try { await chest.withdraw(i.type, null, i.count); } catch (e) {}
      }
    }
    chest.close();
  } catch (e) {}
}

// Check ground drops inside base
try {
  const drops = await lib.pickup(6);
  console.log('Base ground drops:', drops);
} catch (e) {}

// 4. Check time - if dusk/night arrives, sleep in bed to skip night
const t = bot.time.timeOfDay;
console.log(`Current time: ${t}`);
if (t >= 12000 && t <= 23500) {
  console.log('Dusk/night active! Sleeping in bed to skip night...');
  while (!isCancelled() && bot.time.timeOfDay < 12542) {
    await sleep(500);
  }
  const bed = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 6, count: 1 })[0];
  if (bed) {
    try {
      await bot.sleep(bot.blockAt(bed));
      bot.chat('delta: Sleeping in base bed to skip night!');
      await sleep(5000);
      try { await bot.wake(); } catch (e) {}
    } catch (e) {}
  }
}

console.log('Current Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

bot.chat(`delta: Re-centered at base shelter ${lib.fmt(bot.entity.position)}! Spawn locked. Preparing Nether gear.`);
