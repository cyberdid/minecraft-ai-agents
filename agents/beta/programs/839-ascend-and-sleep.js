// programs/839-ascend-and-sleep.js
console.log('=== Program 839: Ascend Shaft & Sleep in Base ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

bot.chat('Beta: Ascending shaft immediately to join team in base beds for night skip!');

const ascentWps = [
  new Vec3(304, 54, -34),
  new Vec3(302, 60, -41),
  new Vec3(302, 71, -44),
  new Vec3(295, 72, -52),
  new Vec3(294, 72, -54)
];

for (let i = 0; i < ascentWps.length; i++) {
  if (checkCancelled()) break;
  const wp = ascentWps[i];
  console.log(`Ascending to WP ${i + 1}/${ascentWps.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: true, timeoutMs: 12000 });
  } catch (e) {
    console.log(`Ascent WP ${i + 1} note: ${e.message}`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
    } catch (e2) {}
  }
}

console.log(`Reached base exterior! Pos: ${lib.fmt(bot.entity.position)}`);

// Enter base door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log(`Door note: ${e.message}`);
  try {
    await lib.goTo(294, 72, -55, 1.2, { timeoutMs: 5000 });
  } catch (e2) {}
}

console.log(`Inside base! Pos: ${lib.fmt(bot.entity.position)}`);

// Sleep in bed
console.log('Attempting to sleep...');
try {
  await lib.sleep();
  console.log('Sleeping! Night successfully skipped!');
} catch (e) {
  console.log(`lib.sleep error: ${e.message}`);
  // Try manually finding any bed block
  const bedBlock = bot.findBlock({
    matching: b => b && b.name.endsWith('_bed'),
    maxDistance: 8
  });
  if (bedBlock) {
    console.log(`Found bed at ${lib.fmt(bedBlock.position)}, attempting to use...`);
    try {
      await bot.sleep(bedBlock);
      console.log('Bot sleeping in bed!');
    } catch (err) {
      console.log(`bot.sleep error: ${err.message}`);
    }
  }
}

bot.chat(`Beta: Inside base at ${lib.fmt(bot.entity.position)}. Ready for morning!`);
return { pos: bot.entity.position, time: bot.time.timeOfDay };
