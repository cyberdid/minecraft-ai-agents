// programs/388-rush-base-or-shelter.js
console.log('=== GAMMA RUSH BASE OR SHELTER ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'time:', JSON.stringify(lib.time()));

// Try to navigate to base entrance
let reachedBase = false;
try {
  console.log('Moving toward base door (294, 72, -53)...');
  await lib.goTo(294, 72, -53, 1, { dig: true });
  console.log('Reached base door area!');
  reachedBase = true;
} catch (e) {
  console.log('Path to base door failed:', e.message);
}

if (reachedBase || bot.entity.position.distanceTo(new Vec3(294, 72, -54)) < 3) {
  // Enter base
  console.log('Entering base...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    console.log('Entered base!');
  } catch (e) {
    try {
      await lib.door(294, 72, -54, true);
      await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -55));
      await lib.door(294, 72, -54, false);
      console.log('Entered base via door toggle!');
    } catch (e2) {
      console.log('Door toggle failed:', e2.message);
    }
  }

  // Set spawn and sleep
  try {
    await lib.setSpawn();
    console.log('Spawn set!');
  } catch (e) {}

  try {
    bot.chat('gamma: Inside base, sleeping to dawn.');
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (e) {
    console.log('sleepInBed:', e.message);
  }
} else {
  // Not at base and night is falling! Emergency shelter!
  console.log('Cannot reach base safely before night! Constructing emergency shelter...');
  bot.chat('gamma: Night falling away from base, sheltering at ' + lib.fmt(bot.entity.position));
  try {
    await lib.shelter();
    console.log('Emergency shelter secured!');
  } catch (err) {
    console.log('lib.shelter error:', err.message);
    // Manual emergency box
    const p = bot.entity.position.floored();
    for (const [dx, dz] of [[1,0], [-1,0], [0,1], [0,-1]]) {
      try { await lib.place('cobblestone', p.x + dx, p.y, p.z + dz); } catch (e) {}
      try { await lib.place('cobblestone', p.x + dx, p.y + 1, p.z + dz); } catch (e) {}
    }
    try { await lib.place('cobblestone', p.x, p.y + 2, p.z); } catch (e) {}
  }
}

await lib.equipWeapon();
console.log('End pos:', lib.fmt(bot.entity.position));
console.log('End status:', JSON.stringify(lib.status()));
