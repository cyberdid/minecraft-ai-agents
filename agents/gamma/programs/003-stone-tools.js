// programs/003-stone-tools.js
console.log('--- Step 1: Crafting table & wooden pickaxe ---');
if (!lib.count('wooden_pickaxe')) {
  await lib.ensureTable();
  await lib.craft('wooden_pickaxe', 1);
}
console.log('wooden_pickaxe:', lib.count('wooden_pickaxe'));

console.log('--- Step 2: Collect stone ---');
await lib.collect('stone', 20);
console.log('cobblestone:', lib.count('cobblestone'));

console.log('--- Step 3: Stone tools & furnace ---');
if (lib.count('stick') < 5) {
  await lib.craft('stick', 4);
}
if (!lib.count('stone_pickaxe')) await lib.craft('stone_pickaxe', 1);
if (!lib.count('stone_sword')) await lib.craft('stone_sword', 1);
if (!lib.count('stone_axe')) await lib.craft('stone_axe', 1);
if (!lib.count('furnace')) await lib.craft('furnace', 1);

console.log('--- Step 4: Emergency dirt ---');
if (lib.count('dirt') < 16) {
  await lib.collect('dirt', 16 - lib.count('dirt'));
}

console.log('--- Summary ---');
console.log('inventory:', JSON.stringify(lib.inv()));
console.log('time:', lib.time().phase, 'night in:', lib.time().secondsUntilNight);
bot.chat(`gamma equipped with stone tools and furnace! Moving on to food and iron.`);
