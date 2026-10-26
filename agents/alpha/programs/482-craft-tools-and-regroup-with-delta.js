// programs/482-craft-tools-and-regroup-with-delta.js
console.log('=== Program 482: Craft Tools at Base & Regroup with Delta ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Walk back to Base Camp at (294, 72, -53)
console.log('Moving to Base Camp...');
try {
  await lib.goToXZ(294, -54);
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 2)); } catch (e2) {}
}

// 2. Enter base shelter
console.log('Entering base shelter...');
try {
  await passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Set spawn at bed
try { await lib.setSpawn(); } catch (e) {}

// 4. Craft stone_pickaxe and stone_sword at base crafting table (295, 72, -56)
console.log('Crafting stone tools at crafting table...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(295, 72, -56, 1));
} catch (e) {}

if (lib.count('stick') < 3 && lib.count('*_planks') >= 2) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe!');
  } catch (err) {
    console.log('Craft pick note:', err.message);
  }
}

if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  } catch (err) {
    console.log('Craft sword note:', err.message);
  }
}

await lib.equipWeapon();
await lib.equipArmor();

console.log('Alpha gear:');
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

// 5. Check if dusk/night to sleep
let t = lib.time();
console.log(`Time: ${t.timeOfDay}, night: ${t.night}, canSleep: ${t.canSleep}`);
if (t.timeOfDay >= 12542 || t.canSleep) {
  console.log('Sleeping in base bed to skip night...');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

// 6. Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat(`team: Alpha armed at base! Tools: ${JSON.stringify(lib.tools())}, Cobble: ${lib.count('cobblestone')}. Ready to march to Blaze Spawner with Delta!`);
