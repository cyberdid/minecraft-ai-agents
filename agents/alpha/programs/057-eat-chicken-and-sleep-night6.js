// programs/057-eat-chicken-and-sleep-night6.js
// Eat cooked_chicken with bot.consume, sleep in bed to skip night

console.log('alpha at:', lib.fmt(bot.entity.position), 'food:', bot.food);

// 1. Eat cooked_chicken
if (lib.count('cooked_chicken') > 0) {
  try {
    console.log('Equipping cooked_chicken...');
    await bot.equip(mcData.itemsByName.cooked_chicken.id, 'hand');
    console.log('Consuming cooked_chicken...');
    await bot.consume();
    console.log('Food level after consuming:', bot.food);
  } catch (e) {
    console.log('Consume error:', e.message);
  }
}

// 2. Wait until tick 12542
while (!isCancelled()) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542) {
    console.log(`canSleep true at ${t.timeOfDay}! Sleeping in bed...`);
    break;
  }
  await sleep(1500);
}

// 3. Sleep in bed
bot.chat('alpha: In bed sleeping with beta to skip night.');
try {
  await lib.sleepInBed();
  console.log('Alpha is sleeping in bed!');
} catch (e) {
  console.log('Sleep note:', e.message);
}

// 4. Wait for daybreak
for (let i = 0; i < 30; i++) {
  await sleep(1000);
  const t = lib.time();
  if (!t.night && (t.timeOfDay < 1000 || t.timeOfDay >= 23460)) {
    console.log(`Daybreak reached! Day 8! timeOfDay: ${t.timeOfDay}`);
    break;
  }
}

try {
  await bot.wake();
} catch (e) {}

const finalTime = lib.time();
console.log('Final time:', finalTime);
bot.chat('alpha: Day 8 dawn! Ready to finish iron chestplate and diamond descent.');

return {
  food: bot.food,
  health: bot.health,
  time: finalTime
};
