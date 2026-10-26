// programs/404-night-sleep-protocol.js
console.log('=== Step: Ensure door closed, monitor Alpha crafting boots, and sleep at 12542 ===');
console.log('Current time:', bot.time.timeOfDay, 'Beta pos:', lib.fmt(bot.entity.position));

// 1. Ensure door is closed
const door = bot.blockAt(new Vec3(294, 72, -54));
if (door && door._properties?.open) {
  console.log('Base door is open, closing it for night...');
  try {
    await bot.activateBlock(door);
    console.log('Door closed.');
  } catch (e) {
    console.log('Door close error:', e.message);
  }
}

// 2. Wait until tick 12542 for night
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  const rem = Math.max(0, Math.ceil((12542 - bot.time.timeOfDay) / 20));
  console.log(`Waiting for night: time=${bot.time.timeOfDay}, ${rem}s left...`);
  await sleep(4000);
}

// 3. Sleep in bed
console.log('Night reached! Time:', bot.time.timeOfDay);
try {
  await lib.sleepInBed();
  console.log('Sleeping in bed...');
} catch (e) {
  console.log('lib.sleepInBed note:', e.message);
  const bedBlock = bot.blockAt(new Vec3(294, 72, -56)) || bot.blockAt(new Vec3(293, 72, -56));
  if (bedBlock) {
    try {
      await bot.sleep(bedBlock);
      console.log('Direct sleep entered at', bedBlock.position);
    } catch (err) {
      console.log('bot.sleep error:', err.message);
    }
  }
}

// 4. Wait for dawn
for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.time.timeOfDay < 1000 || bot.time.timeOfDay > 23450) {
    console.log('Dawn reached! Time:', bot.time.timeOfDay);
    break;
  }
}

if (bot.isSleeping) {
  try {
    await bot.wake();
  } catch (e) {}
}

console.log('Morning check! timeOfDay =', bot.time.timeOfDay, 'health =', bot.health, 'food =', bot.food);
bot.chat(`beta: Morning! Time: ${bot.time.timeOfDay}. Health: ${bot.health}/20, Food: ${bot.food}/20.`);
