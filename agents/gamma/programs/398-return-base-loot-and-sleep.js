// programs/398-return-base-loot-and-sleep.js
console.log('=== RETURN BASE, LOOT CHEST & SLEEP ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Move towards base door outside
console.log('Navigating to base door at (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  console.log('Arrived outside base door! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goTo error:', e.message);
  try {
    // Stage via gentle slope
    await lib.goTo(280, 71, -60, 2, { dig: true });
    await lib.goTo(294, 72, -53, 1, { dig: true });
  } catch (e2) {
    console.log('staged goTo error:', e2.message);
  }
}

// 2. Go through base door
console.log('Entering base...');
let inside = false;
try {
  await lib.goThroughDoor(294, 72, -54);
  inside = true;
  console.log('Inside base!');
} catch (e) {
  console.log('goThroughDoor error:', e.message);
  try {
    await lib.door(294, 72, -54, true);
    await sleep(250);
    await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -55));
    await lib.door(294, 72, -54, false);
    inside = true;
  } catch (e2) {
    console.log('door toggle error:', e2.message);
  }
}

// 3. Set spawn at bed
try {
  console.log('Setting spawn at base bed...');
  await lib.setSpawn();
  console.log('Spawn set!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 4. Inspect & loot chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Chest contents:', JSON.stringify(contents));
  
  const toWithdraw = {};
  if (contents.shield) toWithdraw.shield = 1;
  if (contents.iron_sword && lib.count('*_sword') === 0) toWithdraw.iron_sword = 1;
  if (contents.stone_sword && lib.count('*_sword') === 0) toWithdraw.stone_sword = 1;
  if (contents.cooked_beef) toWithdraw.cooked_beef = Math.min(contents.cooked_beef, 16);
  if (contents.cooked_porkchop) toWithdraw.cooked_porkchop = Math.min(contents.cooked_porkchop, 16);
  if (contents.cooked_mutton) toWithdraw.cooked_mutton = Math.min(contents.cooked_mutton, 16);
  if (contents.bread) toWithdraw.bread = Math.min(contents.bread, 16);
  if (contents.iron_helmet && lib.count('iron_helmet') === 0) toWithdraw.iron_helmet = 1;
  if (contents.iron_chestplate && lib.count('iron_chestplate') === 0) toWithdraw.iron_chestplate = 1;
  if (contents.iron_leggings && lib.count('iron_leggings') === 0) toWithdraw.iron_leggings = 1;
  if (contents.iron_boots && lib.count('iron_boots') === 0) toWithdraw.iron_boots = 1;
  if (contents.golden_boots && lib.count('*_boots') === 0) toWithdraw.golden_boots = 1;
  if (contents.cobblestone && lib.count('cobblestone') < 32) {
    toWithdraw.cobblestone = Math.min(contents.cobblestone, 32 - lib.count('cobblestone'));
  }
  if (contents.iron_ingot) {
    toWithdraw.iron_ingot = Math.min(contents.iron_ingot, 4);
  }

  if (Object.keys(toWithdraw).length > 0) {
    console.log('Withdrawing:', JSON.stringify(toWithdraw));
    await lib.withdraw(toWithdraw, 293, 72, -57);
  }
} catch (e) {
  console.log('Chest interaction error:', e.message);
}

// 5. Equip armor and weapon
try {
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

// 6. Check if we need to craft a stone sword or shield
if (lib.count('*_sword') === 0 && lib.count('cobblestone') >= 2) {
  try {
    if (lib.count('stick') < 1) await lib.craft('stick', 4);
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  } catch (e) {
    console.log('craft stone_sword note:', e.message);
  }
}

if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  try {
    await lib.craft('shield', 1);
    await lib.equipArmor();
    console.log('Crafted and equipped shield!');
  } catch (e) {
    console.log('craft shield note:', e.message);
  }
}

// 7. Sleep if night
const t = lib.time();
console.log('Time status:', JSON.stringify(t));
if (t.night || t.canSleep || t.timeOfDay >= 12542) {
  console.log('Attempting sleep in bed...');
  bot.chat('gamma: Inside base, sleeping in bed.');
  try {
    await lib.sleepInBed();
    console.log('Sleeping...');
    await sleep(4000);
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final status:', JSON.stringify(lib.status()));
bot.chat(`gamma: Inside base safe! Health: ${bot.health}/20, Food: ${bot.food}/20, Gear: ${JSON.stringify(lib.tools())}`);
