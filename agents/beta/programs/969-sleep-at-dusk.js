console.log('=== Program 969: Sleep at Dusk & Skip Night ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

// Wait until tick 12542
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  const rem = 12542 - bot.time.timeOfDay;
  console.log(`Waiting ${rem} ticks for sleep time...`);
  await sleep(Math.min(2500, rem * 50));
}

console.log('Sleep time active! Current time:', bot.time.timeOfDay);

const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
if (bed) {
  try {
    console.log(`Sleeping in bed at ${lib.fmt(bed.position)}...`);
    await bot.sleep(bed);
    console.log('Sleeping... waiting for night to pass...');
    const sleepStart = Date.now();
    while (bot.isSleeping && Date.now() - sleepStart < 12000 && !isCancelled()) {
      await sleep(500);
    }
    console.log('Woke up! Current time:', bot.time.timeOfDay);
    bot.chat('Beta: Good morning! Overworld daytime restored!');
  } catch (e) {
    console.log('Sleep notice:', e.message);
  }
}

// Check Base Chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const cItems = chest.containerItems();
    const pow = cItems.find(i => i.name === 'blaze_powder');
    if (pow) {
      console.log(`Withdrawing ${pow.count} blaze_powder...`);
      await chest.withdraw(pow.type, null, pow.count);
    }
    const rods = cItems.find(i => i.name === 'blaze_rod');
    if (rods) {
      console.log(`Withdrawing ${rods.count} blaze_rod...`);
      await chest.withdraw(rods.type, null, rods.count);
    }
    chest.close();
  } catch (e) {}
}

if (lib.count('blaze_rod') > 0) {
  try { await lib.craft('blaze_powder', lib.count('blaze_rod') * 2); } catch (e) {}
}

const bp = lib.count('blaze_powder');
const ep = lib.count('ender_pearl');
if (bp > 0 && ep > 0) {
  const n = Math.min(bp, ep);
  try {
    await lib.craft('ender_eye', n);
    bot.chat(`Beta: Crafted ${n} ender_eye! Total: ${lib.count('ender_eye')}`);
  } catch (e) {}
}

console.log('Beta Final Inv:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  time: bot.time.timeOfDay,
  eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl')
};
