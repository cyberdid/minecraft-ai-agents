// programs/367-quarry-stone-properly.js
console.log('=== QUARRY STONE PROPERLY AT Y=68 ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Exit base
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -52.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 2. Go to quarry floor at y=68
console.log('Navigating to quarry floor (304, 68, -52)...');
await lib.goTo(304, 68, -52, 1.5, { dig: true });

// 3. Mine 6 stone with wooden pickaxe
console.log('Mining initial stone with wooden pickaxe...');
await lib.collect('stone', 6);
console.log('Cobblestone:', lib.count('cobblestone'));

// 4. Craft stone pickaxe and stone sword
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted stone_pickaxe!');
}
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
  await lib.craft('stone_sword', 1);
  console.log('Crafted stone_sword!');
}

// 5. With stone pickaxe, mine 28 more cobblestone
console.log('Mining building stack of cobblestone with stone pickaxe...');
const needed = Math.max(0, 32 - lib.count('cobblestone'));
if (needed > 0) {
  await lib.collect('stone', needed);
  console.log('Total cobblestone now:', lib.count('cobblestone'));
}

// 6. Craft a second stone sword
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') < 2) {
  await lib.craft('stone_sword', 1);
}

// 7. Check for exposed iron ore right here
const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 16, count: 3 });
console.log('Nearby iron ores:', ironOres.map(o => `${o.name} at ${lib.fmt(o.position)}`).join(', ') || 'none');
if (ironOres.length > 0 && ironOres[0].position.y >= 65) {
  try {
    await lib.dig(ironOres[0].position.x, ironOres[0].position.y, ironOres[0].position.z);
    await lib.pickup(4);
  } catch (e) {}
}

// 8. Return to base
console.log('Returning to base...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 10000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

try {
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

console.log('Ending inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
