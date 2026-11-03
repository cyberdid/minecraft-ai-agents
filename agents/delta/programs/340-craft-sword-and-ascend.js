// programs/340-craft-sword-and-ascend.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Craft sticks if needed
if (lib.count('stick') < 1) {
  if (lib.count('*_planks') < 2) {
    const l = bot.inventory.items().find(i => i.name.endsWith('_log'));
    if (l) await lib.craft(l.name.replace('_log', '_planks'), 4);
  }
  console.log('Crafting sticks...');
  await lib.craft('stick', 4);
}
console.log('Sticks:', lib.count('stick'), 'Planks:', lib.count('*_planks'));

// 2. Craft stone_sword
console.log('Crafting stone_sword...');
await lib.craft('stone_sword', 1);
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) {
  await bot.equip(sword, 'hand');
  console.log('Stone sword equipped!');
}

// Check if crafting table was placed nearby; if so, pick it up
const tableBlock = lib.find('crafting_table', { maxDistance: 5 })[0];
if (tableBlock) {
  console.log('Retrieving placed crafting table at', lib.fmt(tableBlock.position));
  try {
    await lib.dig(tableBlock.position.x, tableBlock.position.y, tableBlock.position.z);
    await lib.pickup(4);
  } catch (e) {
    console.log('Table pickup note:', e.message);
  }
}

// 3. Ascend to base or surface
console.log('Ascending towards base entrance (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 20000 });
} catch (e) {
  console.log('goTo note:', e.message);
}

console.log('Pos after ascend:', lib.fmt(bot.entity.position));
console.log('Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
