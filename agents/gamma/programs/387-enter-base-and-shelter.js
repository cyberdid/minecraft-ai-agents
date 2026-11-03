// programs/387-enter-base-and-shelter.js
console.log('=== GAMMA ENTER BASE & NIGHT PROTOCOL ===');
console.log('Current pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

bot.chat('gamma: Returning to base at (294, 72, -54) for night protocol.');

// 1. Walk/climb to base door outside
console.log('Navigating to base door outside at (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  console.log('Arrived outside base door! Pos:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('goTo failed:', err.message);
  // fallback: direct walkTo / jump
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
}

// 2. Pass through the door
console.log('Entering base...');
let inside = false;
try {
  await lib.goThroughDoor(294, 72, -54);
  inside = true;
  console.log('Entered base via goThroughDoor!');
} catch (e) {
  console.log('goThroughDoor error:', e.message, '- trying door toggle');
  try {
    await lib.door(294, 72, -54, true);
    await sleep(200);
    await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -55));
    await lib.door(294, 72, -54, false);
    inside = true;
  } catch (e2) {
    console.log('door toggle error:', e2.message);
  }
}

console.log('Current pos inside base:', lib.fmt(bot.entity.position));

// 3. Set spawn at bed
try {
  console.log('Setting spawn at base bed...');
  await lib.setSpawn();
  console.log('Spawn set successfully!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 4. Inspect chest if reachable
try {
  const chestPos = new Vec3(293, 72, -57);
  const block = bot.blockAt(chestPos);
  if (block && block.name.includes('chest')) {
    const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
    console.log('Base chest contents:', JSON.stringify(contents));
  } else {
    // Check nearest chest
    const c = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 6 })[0];
    if (c) {
      const contents = await lib.chestContents(c.x, c.y, c.z);
      console.log(`Chest at ${lib.fmt(c)} contents:`, JSON.stringify(contents));
    }
  }
} catch (e) {
  console.log('Chest inspect error:', e.message);
}

// 5. If night arrives, sleep
const t = lib.time();
console.log('Current time status:', JSON.stringify(t));
if (t.night || t.canSleep || t.timeOfDay >= 12542) {
  console.log('Night is here, attempting to sleep...');
  bot.chat('gamma: Sleeping in bed.');
  try {
    await lib.sleepInBed();
    console.log('Sleeping!');
  } catch (e) {
    console.log('Sleep error:', e.message);
  }
}

return { pos: bot.entity.position, inv: lib.inv(), time: lib.time() };
