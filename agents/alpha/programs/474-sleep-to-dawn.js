// programs/474-sleep-to-dawn.js
console.log('=== Program 474: Wait for 12542 & Sleep to Dawn ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Wait until 12542
let t = lib.time();
console.log(`Current time: ${t.timeOfDay}, canSleep: ${t.canSleep}, seconds until night: ${t.secondsUntilNight}`);

while (t.timeOfDay < 12542 && !t.canSleep) {
  if (isCancelled()) break;
  await sleep(1000);
  t = lib.time();
}

console.log(`Sleep time reached! Time: ${t.timeOfDay}, calling lib.sleepInBed()...`);
try {
  await lib.sleepInBed();
  console.log('Slept in bed!');
} catch (err) {
  console.log('Sleep note:', err.message);
}

// Wait for morning
for (let i = 0; i < 20; i++) {
  await sleep(500);
  t = lib.time();
  if (t.timeOfDay > 23000 || t.timeOfDay < 1000) {
    console.log(`*** DAWN CONFIRMED! Time: ${t.timeOfDay} (${t.phase}) ***`);
    break;
  }
}

console.log('Alpha status:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha & Delta awake at dawn! Time=${t.timeOfDay}, HP=${bot.health}, Food=${bot.food}. Ready to gear up and enter Nether!`);
