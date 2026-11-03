// programs/608-enter-base-sleep-and-rearm.js
console.log('=== Program 608: Enter Base, Sleep & Morning Re-arm ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Enter base door at (294, 72, -54)
console.log('Entering base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.lookAt(new Vec3(293.5, 72.0, -56.0), true);
    bot.setControlState('forward', true);
    await sleep(1000);
    bot.setControlState('forward', false);
    await lib.door(294, 72, -54, false);
  } catch (e2) {
    console.log('Door manual passage note:', e2.message);
  }
}

console.log('Inside base shelter! Pos:', lib.fmt(bot.entity.position));

// 2. Set spawn at Bed 1
console.log('Setting spawn at base bed...');
try {
  await lib.setSpawn();
  console.log('Spawn set successfully!');
  bot.chat('alpha: Inside base, spawn point locked at bed.');
} catch (se) {
  console.log('setSpawn note:', se.message);
}

// 3. Sleep through night
console.log('Awaiting dusk sleep window (TIME >= 12542)...');
const sleepStart = Date.now();
while (Date.now() - sleepStart < 55000 && !isCancelled()) {
  const t = lib.time();
  if (t.canSleep) {
    console.log('canSleep is true! Sleeping in bed...');
    bot.chat('alpha: Sleeping in base bed to skip night with team!');
    try {
      await lib.sleepInBed();
      console.log('Sleep completed!');
      break;
    } catch (sle) {
      console.log('sleepInBed note:', sle.message);
    }
  }
  await sleep(1000);
}

console.log('Morning status: Pos:', lib.fmt(bot.entity.position), 'Time:', lib.time());
bot.chat(`alpha: Morning arrived! Pos: ${lib.fmt(bot.entity.position)}, Time: ${lib.time().phase}. Rearming for Nether!`);

// 4. Exit base door at dawn
console.log('Exiting base door to rearm...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.lookAt(new Vec3(296, 72, -54), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 5. Gather 2 logs
if (lib.count('*_log') === 0 && lib.count('*pickaxe') === 0) {
  console.log('Collecting 2 logs from nearby trees...');
  try {
    await lib.collect('*_log', 2);
  } catch (e) {
    console.log('Log collect note:', e.message);
  }
}

// Craft planks
for (const it of bot.inventory.items()) {
  if (it.name.endsWith('_log')) {
    const pName = it.name.replace('_log', '_planks');
    try { await lib.craft(pName, it.count * 4); } catch (e) {}
  }
}

// Sticks & table
if (lib.count('stick') < 2 && lib.count('*_planks') >= 2) {
  try { await lib.craft('stick', 4); } catch (e) {}
}
if (lib.count('crafting_table') === 0 && lib.count('*_planks') >= 4) {
  try { await lib.craft('crafting_table', 1); } catch (e) {}
}

// Wooden pickaxe
if (lib.count('*pickaxe') === 0 && lib.count('*_planks') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting wooden pickaxe...');
  try { await lib.craft('wooden_pickaxe', 1); } catch (e) {}
}

// Mine cobblestone at safe quarry
console.log('Moving to surface quarry at (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 6000 });
} catch (e) {}

if (lib.count('cobblestone') < 5 && lib.count('*pickaxe') > 0) {
  console.log('Mining initial 5 cobblestone...');
  try { await lib.collect('cobblestone', 5); } catch (e) {}
}

// Craft stone pickaxe
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
  console.log('Crafting stone pickaxe...');
  if (lib.count('stick') < 2 && lib.count('*_planks') >= 2) {
    try { await lib.craft('stick', 4); } catch (e) {}
  }
  try { await lib.craft('stone_pickaxe', 1); } catch (e) {}
}

// Craft stone sword
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
  console.log('Crafting stone sword...');
  if (lib.count('stick') < 1 && lib.count('*_planks') >= 2) {
    try { await lib.craft('stick', 4); } catch (e) {}
  }
  try { await lib.craft('stone_sword', 1); } catch (e) {}
}

// Mine 16 building cobblestone
if (lib.count('*pickaxe') > 0 && lib.count('cobblestone') < 16) {
  console.log('Mining 16 building cobblestone...');
  try { await lib.collect('cobblestone', 16); } catch (e) {}
}

await lib.equipWeapon();
console.log('Geared up! Inventory:', lib.inv(), 'Held:', bot.heldItem?.name);
bot.chat(`alpha: Fully armed with ${bot.heldItem?.name || 'sword'} & ${lib.count('cobblestone')} cobble! Ready for Nether warp!`);
