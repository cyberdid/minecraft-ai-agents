// programs/297-craft-tools-and-enter-portal.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Collect 2 logs
console.log('Collecting 2 logs...');
await lib.collect('*_log', 2);
console.log('Logs collected! Count:', lib.count('*_log'));

// 2. Craft planks
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  const plankName = logItem.name.replace('_log', '_planks');
  await lib.craft(plankName, 8);
  console.log('Planks count:', lib.count('*_planks'));
}

// 3. Make sure we have at least 4 sticks
if (lib.count('stick') < 4) {
  await lib.craft('stick', 4);
}
console.log('Sticks count:', lib.count('stick'));

// 4. Craft wooden_pickaxe
console.log('Crafting wooden_pickaxe...');
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe crafted!');

// 5. Mine 3 cobblestone to get stone pickaxe
console.log('Mining 3 cobblestone...');
await lib.collect('cobblestone', 3);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 6. Craft stone_pickaxe
console.log('Crafting stone_pickaxe...');
await lib.craft('stone_pickaxe', 1);
console.log('Stone pickaxe crafted!');

// 7. Mine 24 cobblestone quickly with stone pickaxe
console.log('Mining 24 cobblestone with stone pickaxe...');
await lib.collect('cobblestone', 24);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 8. Craft stone_sword
if (lib.count('stick') < 1) await lib.craft('stick', 4);
console.log('Crafting stone_sword...');
await lib.craft('stone_sword', 1);
console.log('Stone sword crafted!');

// Equip stone_sword
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');

console.log('Current Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

// 9. Move to Overworld Nether Portal at (299.5, 73.0, -53.5)
console.log('Moving to Nether Portal...');
try {
  await lib.goTo(299, 72, -52, 1);
} catch (e) {
  console.log('goTo note:', e.message);
}

// Step onto portal sill y=73 and walk into center
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Inside portal frame! Waiting for teleport to Nether...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (String(bot.game.dimension).includes('nether')) {
  bot.chat(`delta: Re-entered Nether at ${lib.fmt(bot.entity.position)} armed with stone sword & ${lib.count('cobblestone')} cobble! Advancing to Spawner front!`);
}
