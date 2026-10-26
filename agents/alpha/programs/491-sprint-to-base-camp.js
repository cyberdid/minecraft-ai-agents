// programs/491-sprint-to-base-camp.js
console.log('=== Program 491: Sprint to Base Camp ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('team: Alpha sprinting to Base Camp from spawn to re-arm with team!');

// Sprint East towards Base Camp at (294, 72, -54)
try {
  await lib.goToXZ(294, -54);
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2)); } catch (e2) {}
}

console.log('Arrived near base at:', lib.fmt(bot.entity.position));

// Enter base shelter
try {
  await passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// Lock bed spawn
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
} catch (e) {}

// Check nearby teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
  }
}

// Check base chest
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest:', JSON.stringify(chest));
} catch (e) {}

bot.chat(`team: Alpha safely in Base Camp at ${lib.fmt(bot.entity.position)}! HP: ${bot.health}, Food: ${bot.food}.`);
