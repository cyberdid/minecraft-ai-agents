// programs/826-sleep-and-smelt-iron.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 826: Sleep with Team & Smelt Iron ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'time:', bot.time.timeOfDay, 'canSleep:', lib.time().canSleep);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure base door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// Step 1: Wait for tick 12542 and sleep in bed
const waitStart = Date.now();
while (!lib.time().canSleep && Date.now() - waitStart < 15000 && !isCancelled()) {
  await sleep(500);
}

if (lib.time().canSleep) {
  console.log(`Tick ${bot.time.timeOfDay}: sleeping in bed with team!`);
  bot.chat('Beta: Sleeping in base bed now! Team, sleep to skip night!');
  try {
    await lib.sleepInBed();
    console.log('Sleeping! Awaiting dawn...');
    await sleep(4000);
  } catch (e) {
    console.log('Sleep notice:', e.message);
  }
}

// Wait until morning
const dawnWait = Date.now();
while (lib.time().canSleep && Date.now() - dawnWait < 20000 && !isCancelled()) {
  await sleep(1000);
}
try { await bot.wake(); } catch (e) {}

console.log('Dawn reached! Time:', bot.time.timeOfDay, 'HP:', bot.health, 'Food:', bot.food);

// Step 2: Smelt 8 raw_iron using 1 coal in furnace at (295, 72, -55)
if (lib.count('raw_iron') > 0 && lib.count('coal') > 0) {
  console.log('Smelting raw iron with coal in furnace...');
  try {
    await lib.smelt('raw_iron', 'coal', 8);
    console.log(`Smelting complete! Iron ingots now: ${lib.count('iron_ingot')}`);
    bot.chat(`Beta: Smelted ${lib.count('iron_ingot')} iron ingots for team!`);
  } catch (e) {
    console.log('Smelt error:', e.message);
  }
}

// Step 3: Craft bucket if needed
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0 && lib.count('water_bucket') === 0 && lib.count('lava_bucket') === 0) {
  try {
    await lib.craft('bucket', 1);
    console.log('Crafted bucket!');
  } catch (e) {}
}

// Step 4: Check if portal was lit by Alpha
const portalBlocks = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
console.log(`Active nether_portal blocks: ${portalBlocks.length}`);

console.log('=== Program 826 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Iron ingots in inv:', lib.count('iron_ingot'));
console.log('Bucket in inv:', lib.count('bucket'));
console.log('Portal active:', portalBlocks.length > 0);
console.log('Inventory:', lib.inv());

return {
  time: bot.time.timeOfDay,
  hp: bot.health,
  food: bot.food,
  iron_ingots: lib.count('iron_ingot'),
  bucket: lib.count('bucket'),
  portal_active: portalBlocks.length > 0
};
