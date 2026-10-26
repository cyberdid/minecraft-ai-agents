// programs/389-night-protocol-and-sleep.js
console.log('=== Step: Night protocol and sleep in bed ===');
console.log('Current time:', bot.time.timeOfDay, 'Beta pos:', lib.fmt(bot.entity.position));

// 1. Check door at (294, 72, -54)
const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
if (doorBlock) {
  // If open and night is imminent (< 60s), close it
  console.log('Door block at (294, 72, -54): open =', doorBlock._properties?.open);
}

// 2. Announce ready for night sleep
bot.chat('beta: Inside base at (294, 72, -55). Bed ready. Sleeping as soon as night begins (tick 12542)!');

// 3. Wait until timeOfDay >= 12542 (night begins)
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  const rem = Math.max(0, Math.ceil((12542 - bot.time.timeOfDay) / 20));
  console.log(`Waiting for night: time=${bot.time.timeOfDay}, ${rem}s remaining...`);
  await sleep(4000);
}

// 4. Sleep in bed
console.log('Night reached! Time:', bot.time.timeOfDay);
try {
  await lib.sleepInBed();
  console.log('Sleeping in bed...');
} catch (e) {
  console.log('lib.sleepInBed note:', e.message);
  // Try manually right clicking one of the beds
  const bedBlock = bot.blockAt(new Vec3(294, 72, -56)) || bot.blockAt(new Vec3(293, 72, -56));
  if (bedBlock) {
    try {
      await bot.sleep(bedBlock);
      console.log('Manually entered bed:', bedBlock.position);
    } catch (err) {
      console.log('bot.sleep note:', err.message);
    }
  }
}

// 5. Wait for dawn or waking up
let slept = false;
for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.isSleeping) slept = true;
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

console.log('After sleep check: timeOfDay =', bot.time.timeOfDay, 'health =', bot.health, 'food =', bot.food);
bot.chat(`beta: Morning! Time: ${bot.time.timeOfDay}. Health: ${bot.health}/20, Food: ${bot.food}/20.`);
