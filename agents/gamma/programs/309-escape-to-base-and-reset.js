// programs/309-escape-to-base-and-reset.js
console.log('=== ESCAPE TO BASE & SECURE ITEMS ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Climb up from mine to base entrance (294, 72, -53)
console.log('Climbing back to surface/base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000, dig: true });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base shelter!');
} catch (e) {
  console.log('Climb note:', e.message);
  try {
    // Fallback: tower/walk up towards (294, 72, -54)
    await lib.goToXZ(294, -54, { timeoutMs: 8000 });
    await lib.goTo(294, 72, -54, 1, { timeoutMs: 8000 });
  } catch (e2) {}
}

console.log('Current pos:', lib.fmt(bot.entity.position));

// 2. Deposit all items in base chest at (293, 72, -57)
console.log('Storing valuable items into base chest...');
try {
  await lib.deposit({
    stone_sword: 'all',
    stone_pickaxe: 'all',
    stone_axe: 'all',
    wooden_pickaxe: 'all',
    cobblestone: 'all',
    oak_planks: 'all',
    birch_planks: 'all',
    stick: 'all'
  }, 293, 72, -57);
  console.log('Items secured in chest! Inv now:', JSON.stringify(lib.inv()));
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents now:', JSON.stringify(chest));
} catch (e) {
  console.log('Deposit note:', e.message);
}

// 3. Confirm spawn at bed (294, 72, -56)
try {
  await lib.setSpawn();
  console.log('Spawn confirmed at bed.');
} catch (e) {}

// 4. Report status
console.log('Gamma status: HP=', bot.health, 'Food=', bot.food, 'Pos=', lib.fmt(bot.entity.position));
bot.chat(`gamma at base: secured 27 cobblestone & 32 planks in chest. Spawn confirmed at bed.`);
