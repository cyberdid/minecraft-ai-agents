// programs/002-stone-age.js
console.log('--- Step 1: Collect logs ---');
await lib.collect('*_log', 8);
console.log('logs:', lib.count('*_log'));

console.log('--- Step 2: Planks & sticks & wooden pickaxe ---');
await lib.craft('birch_planks', 20);
await lib.craft('stick', 8);
await lib.ensureTable();
await lib.craft('wooden_pickaxe', 1);
console.log('wooden_pickaxe:', lib.count('wooden_pickaxe'));

console.log('--- Step 3: Collect stone ---');
await lib.collect('stone', 20);
console.log('cobblestone:', lib.count('cobblestone'));

console.log('--- Step 4: Stone tools & furnace ---');
await lib.craft('stone_pickaxe', 1);
await lib.craft('stone_sword', 1);
await lib.craft('stone_axe', 1);
await lib.craft('furnace', 1);

console.log('--- Step 5: Emergency dirt ---');
await lib.collect('dirt', 16);

console.log('--- Summary ---');
console.log('inventory:', JSON.stringify(lib.inv()));
console.log('time:', lib.time().phase, 'night in:', lib.time().secondsUntilNight);
