// programs/454-mine-cobble-sword-and-enter-base.js
console.log('=== Program 454: Mine Cobblestone, Craft Sword, Enter Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Equip stone pickaxe
const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (pick) await bot.equip(pick, 'hand');

// 2. Mine cobblestone if time permits (> 90s until night)
let t = lib.time();
console.log(`Time: ${t.timeOfDay}, seconds until night: ${t.secondsUntilNight}`);

if (t.secondsUntilNight > 85) {
  const stoneBlocks = bot.findBlocks({
    matching: mcData.blocksByName.stone.id,
    maxDistance: 8,
    count: 16
  });
  console.log(`Found ${stoneBlocks.length} stone blocks in reach`);

  for (const sp of stoneBlocks) {
    if (isCancelled()) break;
    t = lib.time();
    if (t.secondsUntilNight <= 80) {
      console.log('Time running low, heading to shelter');
      break;
    }
    if (lib.count('cobblestone') >= 16) break;

    try {
      const b = bot.blockAt(sp);
      if (!b || b.name !== 'stone') continue;
      await bot.pathfinder.goto(new goals.GoalLookAtBlock(sp, bot.world));
      await bot.dig(b);
      await lib.pickup(4);
    } catch (e) {
      console.log('Dig note:', e.message);
    }
  }
}

console.log('Cobblestone mined:', lib.count('cobblestone'));

// 3. Craft planks and sticks from log
if (lib.count('*_log') > 0) {
  const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
  if (logItem) {
    try {
      await lib.craft(logItem.name.replace('_log', '_planks'), logItem.count * 4);
    } catch (e) {}
  }
}
if (lib.count('stick') < 2) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

// 4. Return to base shelter
console.log('Moving to base door at (294, 72, -53)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
} catch (e) {
  try { await lib.goToXZ(294, -54); } catch (e2) {}
}

console.log('Entering base...');
try {
  await passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 5. Craft stone_sword at base crafting table
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  } catch (err) {
    console.log('Sword craft note:', err.message);
  }
}

// 6. Check if night to sleep
t = lib.time();
if (t.night && t.canSleep) {
  console.log('Night time, sleeping in bed...');
  try {
    await lib.sleepInBed();
    console.log('Sleep completed!');
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

await lib.equipWeapon();
await lib.equipArmor();

console.log('FINAL STATUS:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha inside base with tools! Gear: ${JSON.stringify(lib.tools())}, Cobble: ${lib.count('cobblestone')}`);
