// programs/378-craft-pickaxe-and-quarry.js
console.log('=== CRAFT PICKAXE & QUARRY COBBLESTONE ===');
console.log('Current inv:', JSON.stringify(lib.inv()));

// 1. Craft wooden pickaxe
if (lib.count('wooden_pickaxe') === 0 && lib.count('stone_pickaxe') === 0) {
  console.log('Crafting wooden_pickaxe...');
  await lib.craft('wooden_pickaxe', 1);
  console.log('Wooden pickaxe crafted!');
}

// 2. Go to quarry floor at (304, 68, -52)
console.log('Navigating to quarry (304, 68, -52)...');
await lib.goTo(304, 68, -52, 2, { dig: true, timeoutMs: 12000 });

// 3. Mine 6 stone
console.log('Mining initial 6 stone...');
await lib.collect('stone', 6);
console.log('Cobblestone:', lib.count('cobblestone'));

// 4. Craft stone pickaxe and stone sword
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted stone_pickaxe!');
}
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
  await lib.craft('stone_sword', 1);
  console.log('Crafted stone_sword!');
}

// 5. Mine 25 more cobblestone
const needed = Math.max(0, 30 - lib.count('cobblestone'));
if (needed > 0) {
  console.log(`Mining ${needed} more cobblestone with stone pickaxe...`);
  await lib.collect('stone', needed);
  console.log('Total cobblestone now:', lib.count('cobblestone'));
}

// 6. Craft backup stone sword and furnace
if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 2) {
  try { await lib.craft('stone_sword', 1); } catch (e) {}
}
if (lib.count('furnace') === 0 && lib.count('cobblestone') >= 8) {
  try { await lib.craft('furnace', 1); } catch (e) {}
}

// 7. Equip best weapon
await lib.equipWeapon();

// 8. If dusk or night approaching, enter base
const t = lib.time();
console.log(`Time: ${t.timeOfDay}, night in: ${t.secondsUntilNight}s`);
if (t.secondsUntilNight < 90 || t.night) {
  console.log('Dusk approaching, entering base...');
  try {
    await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 8000 });
    await lib.goThroughDoor(294, 72, -54);
    console.log('Safely inside base!');
  } catch (e) {}
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
