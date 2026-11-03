// programs/397-craft-sword-and-enter-base.js
console.log('=== CRAFT SWORD & SECURE BASE SHELTER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', JSON.stringify(lib.time()));
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Craft stone sword
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  console.log('Crafting stone_sword...');
  try {
    await lib.ensureTable();
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  } catch (e) {
    console.log('Craft stone_sword note:', e.message);
  }
}

// 2. Equip weapon
await lib.equipWeapon();

// 3. Move to base entrance
console.log('Moving to base door at (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 15000 });
} catch (e) {
  console.log('goTo base door fallback:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
  } catch (e2) {}
}

// 4. Step through door into base
console.log('Entering base...');
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
  } catch (e2) {}
}

// 5. Set spawn
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
} catch (e) {}

// 6. Check time; if night, sleep
const t = lib.time();
console.log('Time:', JSON.stringify(t));
if (t.canSleep || t.night || t.timeOfDay >= 12542) {
  console.log('Dusk/night arrived. Sleeping in bed...');
  bot.chat('gamma: Inside base, sleeping in bed to skip night.');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (e) {
    console.log('sleepInBed note:', e.message);
  }
} else {
  bot.chat(`gamma: Inside base shelter! Armed with stone_sword. Waiting for teammates to sleep (night in ${t.secondsUntilNight}s).`);
}

console.log('Ending inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
