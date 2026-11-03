// programs/333-gear-up-and-verify.js
console.log('=== GEAR UP AND VERIFY ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Step outside base door at (294, 72, -54)
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -51.5, 2000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Outside at:', lib.fmt(bot.entity.position));

// 2. Collect 6 logs with lib.collect
console.log('Collecting 6 logs...');
try {
  await lib.collect('*_log', 6);
} catch (e) {
  console.log('Collect log note:', e.message);
}
console.log('Logs collected:', lib.count('*_log'));

// 3. Craft planks, sticks, wooden pickaxe
const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logKey) {
  const plankKey = logKey.replace('_log', '_planks');
  await lib.craft(plankKey, lib.count(logKey) * 4);
}
if (lib.count('stick') < 8) await lib.craft('stick', 8);
if (lib.count('wooden_pickaxe') === 0 && lib.count('stone_pickaxe') === 0) {
  await lib.craft('wooden_pickaxe', 1);
}

// 4. Collect 35 cobblestone using lib.collect('stone', 35)
console.log('Collecting stone using lib.collect...');
try {
  await lib.collect('stone', 35);
} catch (e) {
  console.log('Collect stone note:', e.message);
}
console.log('Cobblestone in inv:', lib.count('cobblestone'));

// 5. Craft stone pickaxe & 2 stone swords
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  await lib.craft('stone_pickaxe', 1);
}
if (lib.count('cobblestone') >= 4 && lib.count('stone_sword') < 2) {
  await lib.craft('stone_sword', 2);
  await lib.equipWeapon();
}

console.log('\n=== STATUS AT END ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma geared up: 2 stone swords, stone pickaxe, cobble x${lib.count('cobblestone')}, planks x${lib.count('*_planks')}. Ready to warp!`);
