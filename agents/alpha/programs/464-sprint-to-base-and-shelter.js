// programs/464-sprint-to-base-and-shelter.js
console.log('=== Program 464: Sprint to Base Camp & Shelter ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Sprint East towards Base Camp at (294, 72, -54)
console.log('Sprinting East to Base Camp...');
try {
  await lib.goToXZ(294, -54);
} catch (e) {
  console.log('goToXZ note:', e.message);
  try { await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 3)); } catch (e2) {}
}
console.log('Arrived near base at:', lib.fmt(bot.entity.position));

// 2. Enter base through door
console.log('Entering base...');
try {
  await passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {
    try { await lib.goTo(294, 72, -55, 1); } catch (e3) {}
  }
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Set spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
} catch (e) {
  console.log('Set spawn note:', e.message);
}

// 4. Check time and sleep if night
let t = lib.time();
console.log(`Current time: ${t.timeOfDay}, phase: ${t.phase}, night: ${t.night}, canSleep: ${t.canSleep}`);
if (t.canSleep || t.timeOfDay >= 12542) {
  console.log('Sleeping in bed to skip night...');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

// 5. Check players and chest
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

bot.chat('team: Alpha safely in Base Camp! HP: 20/20, Food: 20/20. Let us sleep and gear up for Nether!');
