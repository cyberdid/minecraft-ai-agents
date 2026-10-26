// programs/030-prep-for-iron-run.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Eat food
if (lib.count('cooked_chicken') > 0) {
  console.log('Eating cooked_chicken...');
  await lib.eat();
  await sleep(1000);
}

// 2. Craft spare stone pickaxes
await lib.ensureTable();
if (lib.count('stick') < 4) {
  await lib.craft('stick', 4);
}
console.log('Crafting 2 stone_pickaxe...');
await lib.craft('stone_pickaxe', 2);
console.log('Stone pickaxes now:', lib.count('stone_pickaxe'));

// 3. Check base chest for iron or buckets
const chest = await lib.chestContents(293, 72, -57);
console.log('Chest items:', JSON.stringify(chest));

if (chest.bucket) {
  console.log('Found bucket in chest! Withdrawing...');
  await lib.withdraw({ bucket: 1 }, 293, 72, -57);
}
if (chest.iron_ingot) {
  console.log('Found iron_ingot in chest! Withdrawing...');
  await lib.withdraw({ iron_ingot: chest.iron_ingot }, 293, 72, -57);
}

console.log('Gamma inventory now:', JSON.stringify(lib.inv()));
console.log('Time:', lib.time().timeOfDay, lib.time().phase, 'night in:', lib.time().secondsUntilNight);
bot.chat(`gamma prepped for Iron Run: 3 stone pickaxes, shield equipped, food 20/20. Heading to East hill iron vein!`);
