// programs/455-climb-to-base-and-sleep.js
console.log('=== Program 455: Climb to Base Floor & Sleep ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
await sleep(100);

// 1. If below base floor (y < 71), get up to y=72
if (bot.entity.position.y < 71) {
  console.log(`Currently at y=${bot.entity.position.y.toFixed(1)}, climbing up to y=72...`);
  try {
    await lib.goTo(294, 72, -55, 1);
  } catch (err) {
    console.log('lib.goTo error, trying manual tower:', err.message);
    for (let i = 0; i < 8 && bot.entity.position.y < 71.5; i++) {
      const mat = bot.inventory.items().find(it => ['dirt', 'cobblestone', 'oak_planks'].includes(it.name));
      if (!mat) break;
      await bot.equip(mat, 'hand');
      bot.setControlState('jump', true);
      await sleep(250);
      const floorBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
      if (floorBlock) {
        try { await bot.placeBlock(floorBlock, new Vec3(0, 1, 0)); } catch (e) {}
      }
      bot.setControlState('jump', false);
      await sleep(250);
    }
  }
}

console.log('Now at:', lib.fmt(bot.entity.position));

// 2. Make sure inside base at bed
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55, 1));
} catch (e) {}

// 3. Wait for sleep time (12542)
let t = lib.time();
console.log(`Current time: ${t.timeOfDay}, canSleep: ${t.canSleep}`);
if (t.timeOfDay < 12542 && t.timeOfDay > 10000) {
  const waitMs = Math.max(500, (12542 - t.timeOfDay) * 50);
  console.log(`Waiting ${waitMs}ms until sleep time (12542)...`);
  await sleep(Math.min(waitMs, 10000));
}

// 4. Sleep in bed
console.log('Calling lib.sleepInBed()...');
try {
  await lib.sleepInBed();
  console.log('Slept in bed!');
} catch (err) {
  console.log('Sleep note:', err.message);
}

// 5. Check time after sleep
t = lib.time();
console.log(`Time after sleep: ${t.timeOfDay} (${t.phase})`);

console.log('Alpha status:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('Tools:', JSON.stringify(lib.tools()));

bot.chat(`team: Alpha inside base at Bed 1! Time=${t.timeOfDay}.`);
