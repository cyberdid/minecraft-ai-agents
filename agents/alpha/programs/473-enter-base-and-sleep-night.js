// programs/473-enter-base-and-sleep-night.js
console.log('=== Program 473: Enter Base & Sleep Night ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Walk up to base door at (294, 72, -53)
console.log('Climbing up to base door...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2)); } catch (e2) {}
}

// 2. Enter base
console.log('Entering base...');
try {
  await passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {
    try { await lib.goTo(294, 72, -55, 1); } catch (e3) {}
  }
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Set spawn at Bed 1
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
} catch (e) {
  console.log('Set spawn note:', e.message);
}

// 4. Wait for night and sleep
let t = lib.time();
console.log(`Current time: ${t.timeOfDay}, phase: ${t.phase}, night: ${t.night}, canSleep: ${t.canSleep}`);
if (t.timeOfDay < 12542 && t.timeOfDay > 10500) {
  const waitMs = Math.max(500, (12542 - t.timeOfDay) * 50);
  console.log(`Waiting ${waitMs}ms until sleep time (12542)...`);
  await sleep(Math.min(waitMs, 10000));
}

// Sleep in bed
t = lib.time();
if (t.canSleep || t.timeOfDay >= 12542) {
  console.log('Sleeping in base bed...');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed! Night skipped to dawn.');
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

// 5. Check base chest
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
} catch (e) {}

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

bot.chat(`team: Alpha inside base at Bed 1! HP: ${bot.health}, Food: ${bot.food}. Ready for dawn regroup.`);
