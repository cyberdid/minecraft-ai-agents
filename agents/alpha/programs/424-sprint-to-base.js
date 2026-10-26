// programs/424-sprint-to-base.js
console.log('=== Program 424: Sprint from World Spawn to Base Shelter ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Announce sprint in chat
bot.chat('team: Alpha respawned at world spawn with 20/20 HP and 20/20 Food! Sprinting East to base at (294, 72, -54).');

// 2. Stage 1: Sprint to intermediate waypoint (200, 68, -75)
console.log('Sprinting to Waypoint 1: (200, 68, -75)...');
try {
  await lib.goToXZ(200, -75);
  console.log('Waypoint 1 reached at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Waypoint 1 note:', e.message);
}

// 3. Stage 2: Sprint to base door (294, 72, -54)
console.log('Sprinting to Base Door at (294, 72, -54)...');
try {
  await lib.goToXZ(294, -54);
  console.log('Near base door at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Base approach note:', e.message);
}

// 4. Enter base shelter
console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  try {
    await lib.goTo(294, 72, -55, 1);
  } catch (e2) {}
}

// 5. Set spawn point at bed
console.log('Setting spawn at base bed...');
try {
  const spawnRes = await lib.setSpawn();
  console.log('setSpawn result:', spawnRes);
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 6. Inspect base chest (293, 72, -57)
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
} catch (e) {}

console.log('Alpha final pos:', lib.fmt(bot.entity.position));
console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha arrived at base ${lib.fmt(bot.entity.position)}! HP=${bot.health}, Food=${bot.food}.`);
