console.log('=== CLEAR WATER IN MOLD & SLEEP FOR NIGHT ===');

// Step 1: Clear water at (299, 72, -54) by placing cobblestone and digging it back up
const sill = bot.blockAt(new Vec3(299, 72, -54));
if (sill && sill.name === 'water') {
  console.log('Placing cobblestone to absorb water at (299, 72, -54)...');
  try {
    await lib.place('cobblestone', 299, 72, -54);
    await sleep(300);
    console.log('Digging cobblestone to leave dry air mold...');
    await lib.dig(299, 72, -54);
    console.log('Dry mold restored at (299, 72, -54)!');
  } catch (e) {
    console.log('Clear water error:', e.message);
  }
}

// Step 2: Step inside base door to Bed 2
console.log('Stepping inside base to Bed 2...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(295, 72, -54));
  const door = bot.blockAt(new Vec3(294, 72, -54));
  if (door && !door._properties?.open) {
    await bot.activateBlock(door);
    await sleep(200);
  }
  await bot.pathfinder.goto(new goals.GoalNear(293.0, 72.0, -56.0, 0.6));
} catch (e) {
  console.log('Goto bed error:', e.message);
}

console.log('Inside base at:', lib.fmt(bot.entity.position));
bot.chat('delta: Basin (299, 72, -54) cleared and dry! Inside base beside Bed 2 to sleep at tick 12542.');

// Step 3: Sleep when canSleep is true
const start = Date.now();
while (!isCancelled() && Date.now() - start < 45000) {
  const t = lib.time();
  if (t.canSleep) {
    const bed = bot.findBlock({ matching: b => b && b.name.endsWith('_bed'), maxDistance: 4 });
    if (bed) {
      console.log('Sleeping in bed at', lib.fmt(bed.position));
      try {
        await bot.sleep(bed);
        console.log('Delta is sleeping in bed!');
        bot.chat('delta: Sleeping in Bed 2!');
        while (bot.isSleeping && !isCancelled()) {
          await sleep(400);
        }
        console.log('Woke up! Day arrived!');
        bot.chat('delta: Dawn arrived! Ready to cast obsidian and ignite!');
        break;
      } catch (err) {
        console.log('bot.sleep error:', err.message);
      }
    }
  }
  await sleep(1000);
}

return {
  time: bot.time.timeOfDay,
  hp: bot.health,
  food: bot.food
};
