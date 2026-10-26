// programs/157-return-to-overworld-and-sleep.js
console.log('--- RETURN TO OVERWORLD & REGROUP AT BASE ---');
console.log('Current dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 1. Step directly into Nether portal block at (40.5, 65, -7)
if (String(bot.game.dimension).includes('nether')) {
  console.log('Stepping into Nether portal at (40.5, 65, -7)...');
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(40, 65, -7));
  } catch (e) {
    console.log('goto portal err:', e.message);
  }
  bot.clearControlStates();
  console.log('Standing still inside portal for transit...');

  const t0 = Date.now();
  while (String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
    await sleep(1000);
    console.log(`Waiting in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
  }

  if (String(bot.game.dimension).includes('nether')) {
    throw new Error('Did not transition to Overworld within 25s');
  }
}

console.log('SUCCESS! Arrived in Overworld at:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 2. Go to base door at (294, 72, -54) and enter base
try {
  console.log('Moving towards base door...');
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo door err:', e.message);
}

// Enter through door or walk in
try {
  const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
  if (doorBlock && doorBlock.name.includes('door')) {
    console.log('Going through base door...');
    await lib.goThroughDoor(294, 72, -54);
  } else {
    await bot.pathfinder.goto(new goals.GoalBlock(293, 72, -56));
  }
} catch (e) {
  console.log('Door passage note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(293, 72, -56));
  } catch (e2) {}
}

// Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
bot.chat('gamma is inside base! Ready to sleep and re-arm with the team.');

// 3. Set spawn and attempt sleep if night
try {
  await lib.setSpawn();
  console.log('Spawn set!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

if (lib.time().canSleep) {
  console.log('Sleeping in bed...');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (e) {
    console.log('sleepInBed note:', e.message);
  }
}

// 4. Inspect base chest & furnaces
console.log('Checking base chest...');
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Chest (293, 72, -57):', JSON.stringify(chest));
} catch (e) {
  console.log('Chest note:', e.message);
}

console.log('Checking nearby chests:');
const nearbyChests = bot.findBlocks({ matching: b => b.name.includes('chest'), maxDistance: 6, count: 5 });
for (const cp of nearbyChests) {
  try {
    const c = await lib.chestContents(cp.x, cp.y, cp.z);
    console.log(`Chest at ${lib.fmt(cp)}:`, JSON.stringify(c));
  } catch (e) {}
}

console.log('Time at end:', JSON.stringify(lib.time()));
console.log('Gamma inv:', JSON.stringify(lib.inv()));
