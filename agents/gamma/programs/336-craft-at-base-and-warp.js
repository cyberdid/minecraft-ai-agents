// programs/336-craft-at-base-and-warp.js
console.log('=== CRAFT AT BASE & WARP NETHER ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Walk to base door at (294, 72, -53)
console.log('Walking to base door...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 10000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
  } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Craft stone tools at crafting table at (295, 72, -56)
console.log('Crafting stone_pickaxe and stone_swords...');
try {
  await lib.goTo(295, 72, -55, 1, { timeoutMs: 4000 });
  await lib.craft('stone_pickaxe', 1);
  await lib.craft('stone_sword', 2);
  await lib.equipWeapon();
  console.log('Crafted and equipped weapons!');
} catch (e) {
  console.log('Craft note:', e.message);
}

console.log('Armed! Inventory:', JSON.stringify(lib.inv()));
console.log('Tools:', JSON.stringify(lib.tools()));

// 3. Step out base door to Nether Portal at (299.5, 73.0, -53.5)
console.log('Exiting to Nether portal at (299.5, 73.0, -53.5)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.door(294, 72, -54, true); await lib.walkTo(294.5, -51.5, 2000); await lib.door(294, 72, -54, false); } catch (e2) {}
}

try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 6000 });
} catch (e) {}

// Step into portal block at y=73
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Standing in portal at ' + lib.fmt(bot.entity.position) + ', waiting for warp...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('\n=== WARP RESULT ===');
console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
bot.chat(`gamma warped to Nether! Pos: ${lib.fmt(bot.entity.position)}, Cobble: ${lib.count('cobblestone')}, Swords: ${lib.count('stone_sword')}`);
