// programs/398-walk-to-base-and-sleep.js
console.log('=== RETREAT TO BASE & SLEEP ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Move to base door outside at (294, 72, -53)
console.log('Navigating to base door (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 25000 });
} catch (e) {
  console.log('goTo door note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
  } catch (e2) {}
}

console.log('Arrived near base door! Pos:', lib.fmt(bot.entity.position));

// 2. Step through door into base
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await sleep(200);
    await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -55));
    await lib.door(294, 72, -54, false);
    console.log('Inside base via door toggle!');
  } catch (e2) {
    console.log('Door toggle note:', e2.message);
  }
}

console.log('Inside base pos:', lib.fmt(bot.entity.position));

// 3. Craft stone sword using base crafting table
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  console.log('Crafting stone_sword at base crafting table...');
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  } catch (e) {
    console.log('Craft stone_sword error:', e.message);
  }
}

await lib.equipWeapon();

// 4. Set spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn point refreshed at base bed!');
} catch (e) {}

// 5. Wait for sleeping time if dusk is near
let t = lib.time();
console.log(`Current timeOfDay: ${t.timeOfDay}, canSleep: ${t.canSleep}, secondsUntilNight: ${t.secondsUntilNight}`);
if (t.timeOfDay < 12542 && t.timeOfDay >= 11500) {
  const waitMs = Math.min(25000, (12542 - t.timeOfDay) * 50);
  console.log(`Waiting ${waitMs}ms until sleep time (12542)...`);
  await sleep(waitMs);
}

t = lib.time();
if (t.canSleep || t.timeOfDay >= 12542 || t.night) {
  console.log('Night/sleep time reached! Sleeping in bed...');
  bot.chat('gamma: Inside base, sleeping in bed to skip night.');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (e) {
    console.log('sleepInBed error:', e.message);
  }
} else {
  bot.chat(`gamma: Inside base! Armed with stone_sword & 15 cobble. Ready for night.`);
}

console.log('Ending inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
