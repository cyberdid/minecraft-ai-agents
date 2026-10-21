// programs/021-sleep-to-skip-night.js
// Wait until tick 12542, then sleep in bed to skip night with beta

console.log('Current timeOfDay:', lib.time().timeOfDay, 'canSleep:', lib.time().canSleep);

// Ensure door is closed
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}

bot.chat('alpha: Inside base with spawn set. Waiting for 12542 to sleep in bed.');

// Wait until canSleep is true
while (!isCancelled()) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542) {
    console.log(`canSleep is now true! (timeOfDay: ${t.timeOfDay}). Sleeping...`);
    break;
  }
  await sleep(3000);
}

// Sleep in bed
bot.chat('alpha: In bed now! Goodnight.');
try {
  await lib.sleepInBed();
  console.log('Slept in bed!');
} catch (e) {
  console.log('Sleep note:', e.message);
}

// Wait until morning
let morning = false;
for (let i = 0; i < 20; i++) {
  await sleep(1000);
  const t = lib.time();
  if (!t.night || t.timeOfDay < 1000 || t.timeOfDay > 23000) {
    morning = true;
    console.log('Morning reached! timeOfDay:', t.timeOfDay);
    break;
  }
}

bot.chat('alpha: Morning! Night skipped successfully.');

const finalTime = lib.time();
console.log('Time after sleep:', finalTime);

return {
  time: finalTime,
  pos: bot.entity.position
};
