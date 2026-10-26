// programs/295-set-spawn-and-sleep-routine.js
console.log('=== SET SPAWN & SLEEP ROUTINE ===');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Set spawn at bed
try {
  console.log('Setting spawn at base bed...');
  await lib.setSpawn();
  console.log('Spawn set successfully!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 2. Craft remaining oak logs into planks
const logs = lib.count('*_log');
if (logs > 0) {
  console.log(`Crafting ${logs} logs into oak_planks...`);
  await lib.craft('oak_planks', logs * 4);
}
console.log('Planks now:', lib.count('*_planks'));

// 3. Inform Beta in chat
bot.chat('beta: night falling soon. Base bed is open at (294, 72, -55..-56). Sleep to skip night!');

// 4. Wait for canSleep or night
console.log('Waiting for sleep time (tick >= 12542)...');
while (!isCancelled()) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542 || t.timeOfDay > 23000) {
    console.log(`Time is ${t.timeOfDay} (${t.phase}), attempting to sleep...`);
    try {
      await lib.sleepInBed();
      console.log('Sleeping in bed...');
      // Wait for morning
      while (!isCancelled()) {
        await sleep(1000);
        const t2 = lib.time();
        if (!t2.night && t2.timeOfDay < 12000) {
          console.log(`Woke up at dawn! timeOfDay=${t2.timeOfDay}`);
          break;
        }
      }
      break;
    } catch (e) {
      console.log('sleepInBed note:', e.message);
      await sleep(2000);
    }
  } else {
    console.log(`timeOfDay=${t.timeOfDay}, night in ${t.secondsUntilNight}s...`);
    await sleep(3000);
  }
}

console.log('Morning status:', JSON.stringify(lib.status()));
bot.chat(`gamma awake at dawn! Ready to hunt food & mine iron. Inv: planks x${lib.count('*_planks')}, cobble x${lib.count('cobblestone')}`);
