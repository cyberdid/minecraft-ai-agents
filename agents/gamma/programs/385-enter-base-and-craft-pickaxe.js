// programs/385-enter-base-and-craft-pickaxe.js
console.log('=== ENTER BASE & PREPARE NETHER LOADOUT ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Move to base door with dig enabled
console.log('Climbing to base entrance (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 15000 });
} catch (e) {
  console.log('goTo door note:', e.message);
}

// 2. Step through door into base
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Craft sticks if needed
if (lib.count('stick') < 2 && lib.count('oak_planks') >= 2) {
  console.log('Crafting sticks...');
  await lib.craft('stick', 4);
}

// 4. Craft stone pickaxe
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting stone_pickaxe inside base...');
  await lib.craft('stone_pickaxe', 1);
  console.log('Stone pickaxe crafted!');
}

// 5. Exit door to east quarry
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -52.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 6. Mine 25 cobblestone at quarry floor
console.log('Navigating to quarry floor (304, 68, -52)...');
try {
  await lib.goTo(304, 68, -52, 2, { dig: true, timeoutMs: 10000 });
  const needed = Math.max(0, 25 - lib.count('cobblestone'));
  if (needed > 0) {
    await lib.collect('stone', needed);
    console.log(`Mined cobblestone! Total: ${lib.count('cobblestone')}`);
  }
} catch (e) {
  console.log('Quarry error:', e.message);
}

// 7. Craft second stone sword
if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  try { await lib.craft('stone_sword', 1); } catch (e) {}
}

// 8. Return to base
console.log('Returning into base shelter...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 8000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {}

await lib.equipWeapon();
console.log('Ending inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
