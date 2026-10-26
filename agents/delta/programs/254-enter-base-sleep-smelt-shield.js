// programs/254-enter-base-sleep-smelt-shield.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

bot.pathfinder.stop();
await sleep(100);

// 1. Enter base shelter through door at (294, 72, -54)
console.log('Entering base shelter...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door passage attempt 1:', e.message);
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
  await lib.goThroughDoor(294, 72, -54);
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 2. Sleep in bed if night/dusk (time >= 12542)
const t = bot.time.timeOfDay;
console.log('Current timeOfDay:', t);
if (t >= 12500 && t < 23460) {
  console.log('Dusk/night detected. Finding bed...');
  const bedBlockPos = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 6, count: 1 })[0];
  if (bedBlockPos) {
    const bed = bot.blockAt(bedBlockPos);
    console.log('Found bed at', lib.fmt(bedBlockPos), 'attempting to sleep...');
    bot.chat('delta: Sleeping in base bed to skip night to dawn!');
    try {
      while (bot.time.timeOfDay < 12542) {
        await sleep(200);
      }
      await bot.sleep(bed);
      console.log('Sleeping...');
      await sleep(3500);
      if (bot.isSleeping) await bot.wake();
      console.log('Awake! New timeOfDay:', bot.time.timeOfDay);
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
}

// 3. Smelt raw_iron into iron_ingot using furnace at (295, 72, -55)
console.log('Smelting raw_iron into iron_ingot...');
if (lib.count('raw_iron') > 0 && lib.count('iron_ingot') < 1) {
  try {
    // Ensure we have planks for fuel
    if (lib.count('oak_planks') < 2 && lib.count('oak_log') > 0) {
      await lib.craft('oak_planks', 4);
    }
    await lib.smelt('raw_iron', 'oak_planks', 1);
    console.log('Iron smelted! Inv:', JSON.stringify(lib.inv()));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

// 4. Craft shield
if (lib.count('iron_ingot') > 0 && lib.count('shield') < 1) {
  try {
    if (lib.count('oak_planks') < 6 && lib.count('oak_log') > 0) {
      await lib.craft('oak_planks', 8);
    }
    console.log('Crafting shield...');
    await lib.craft('shield', 1);
    console.log('Shield crafted successfully!');
  } catch (e) {
    console.log('Shield craft note:', e.message);
  }
}

// Equip shield in off-hand
if (lib.count('shield') > 0) {
  await bot.equip(mcData.itemsByName.shield.id, 'off-hand');
  console.log('Shield equipped in off-hand!');
}

// 5. Craft stone swords if needed
if (lib.count('stone_sword') < 2) {
  try {
    if (lib.count('stick') < 2) {
      await lib.craft('stick', 4);
    }
    await lib.craft('stone_sword', 2);
    console.log('Crafted stone swords!');
  } catch (e) {}
}

console.log('Final inv before portal:', JSON.stringify(lib.inv()));
bot.chat(`delta: Fully geared with shield (offhand), stone swords, and ${lib.count('cobblestone')} cobble! Entering Nether!`);

// 6. Step outside through door to Nether Portal at (299.5, 73.0, -54.0)
console.log('Stepping through door to Nether Portal...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

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

console.log('Result dim:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension === 'the_nether') {
  bot.chat(`delta: Arrived in Nether with shield & gear at ${lib.fmt(bot.entity.position)}!`);
}
