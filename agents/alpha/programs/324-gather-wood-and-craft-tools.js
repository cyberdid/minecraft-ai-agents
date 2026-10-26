// programs/324-gather-wood-and-craft-tools.js
console.log('=== Program 324: Gather Wood & Craft Stone Tools ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Collect 4 oak logs from nearby trees
try {
  console.log('Collecting 4 logs...');
  const got = await lib.collect('*_log', 4);
  console.log('Collected logs:', JSON.stringify(got));
} catch (e) {
  console.log('Collect logs note:', e.message);
}

// 2. Craft planks and sticks
try {
  await lib.craft('oak_planks', 12);
  await lib.craft('stick', 8);
  console.log('Planks & sticks crafted! Inv:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Craft wood note:', e.message);
}

// 3. Craft stone tools (we have 29 cobblestone)
try {
  await lib.craft('stone_pickaxe', 1);
  await lib.craft('stone_sword', 1);
  await lib.craft('stone_axe', 1);
  console.log('Stone tools crafted! Inv:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Craft tools note:', e.message);
}

// 4. Equip best weapon
await lib.equipWeapon();
console.log('Tools ready! Alpha gear:', JSON.stringify(lib.tools()));
