// programs/261-sleep-in-base-and-craft-swords.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

bot.pathfinder.stop();
await sleep(150);

// 1. Enter base shelter through door at (294, 72, -54)
console.log('Entering base shelter through door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door passage attempt:', e.message);
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
  await lib.goThroughDoor(294, 72, -54);
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 2. Sleep in bed when time allows (12542 to 23460)
console.log('Checking bed and time for sleep...');
const bedPos = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 6, count: 1 })[0];
if (bedPos) {
  const bed = bot.blockAt(bedPos);
  console.log('Found bed at', lib.fmt(bedPos));
  const t = bot.time.timeOfDay;
  if (t >= 12500 && t < 23460) {
    bot.chat('delta: Sleeping in base bed to skip night to dawn!');
    while (bot.time.timeOfDay < 12542) {
      await sleep(200);
    }
    try {
      await bot.sleep(bed);
      console.log('Sleeping...');
      await sleep(3500);
      if (bot.isSleeping) await bot.wake();
      console.log('Dawn reached! Time:', bot.time.timeOfDay);
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
}

// 3. Step to mine shaft at (302, 71, -44) and mine 20 cobblestone with stone pickaxe
console.log('Mining 20 cobblestone with stone_pickaxe...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

try {
  await bot.pathfinder.goto(new goals.GoalNear(304, 60, -55, 2));
  console.log('In mine shaft at:', lib.fmt(bot.entity.position));
  
  // Mine 20 cobblestone
  while (lib.count('cobblestone') < 20 && !isCancelled()) {
    const stones = bot.findBlocks({ matching: b => b.name === 'stone' || b.name === 'deepslate', maxDistance: 4, count: 8 });
    if (stones.length === 0) break;
    for (const p of stones) {
      if (lib.count('cobblestone') >= 20 || isCancelled()) break;
      try {
        await lib.dig(p.x, p.y, p.z);
      } catch (e) {}
    }
    await lib.pickup(4);
  }
} catch (e) {
  console.log('Mine shaft note:', e.message);
}
console.log('Cobblestone count:', lib.count('cobblestone'));

// 4. Craft 2 stone swords
console.log('Crafting stone swords...');
try {
  if (lib.count('stick') < 2) {
    await lib.craft('stick', 4);
  }
  if (lib.count('cobblestone') >= 4) {
    await lib.craft('stone_sword', 2);
    console.log('Crafted 2 stone swords!');
  }
} catch (e) {
  console.log('Sword craft note:', e.message);
}

// 5. Walk to Nether portal and transit
console.log('Stepping to Nether portal at (299, 73, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(298, 72, -54, 2));
} catch (e) {}

bot.chat(`delta: Armed with stone swords & ${lib.count('cobblestone')} cobble! Entering Nether!`);

await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(800);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Inside portal frame. Waiting for dimension transition...');
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension === 'the_nether') {
  bot.chat(`delta: Re-entered Nether at ${lib.fmt(bot.entity.position)} with stone gear & ${lib.count('cobblestone')} cobble!`);
}
