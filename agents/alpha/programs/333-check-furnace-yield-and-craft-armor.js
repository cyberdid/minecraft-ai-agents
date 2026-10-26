// programs/333-check-furnace-yield-and-craft-armor.js
console.log('=== Program 333: Check Smelting & Craft Remaining Armor ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Check chest and base for iron ingots
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest items:', JSON.stringify(contents));
  if (contents.iron_ingot > 0) {
    await lib.withdraw({ iron_ingot: contents.iron_ingot }, 293, 72, -57);
  }
} catch (e) {
  console.log('Chest check note:', e.message);
}

// 2. Craft whatever iron armor pieces we can (helmet=5, leggings=7, boots=4)
const iron = lib.count('iron_ingot');
console.log(`Current iron_ingots in inventory: ${iron}`);

if (iron >= 7 && !bot.inventory.items().some(i => i.name === 'iron_leggings')) {
  try {
    await lib.craft('iron_leggings', 1);
    console.log('Crafted iron_leggings!');
  } catch (e) { console.log('Leggings note:', e.message); }
}

if (lib.count('iron_ingot') >= 5 && !bot.inventory.items().some(i => i.name === 'iron_helmet')) {
  try {
    await lib.craft('iron_helmet', 1);
    console.log('Crafted iron_helmet!');
  } catch (e) { console.log('Helmet note:', e.message); }
}

if (lib.count('iron_ingot') >= 4 && !bot.inventory.items().some(i => i.name === 'iron_boots')) {
  try {
    await lib.craft('iron_boots', 1);
    console.log('Crafted iron_boots!');
  } catch (e) { console.log('Boots note:', e.message); }
}

// 3. Equip armor
await lib.equipArmor();
await lib.equipWeapon();

console.log('Alpha gear now:', JSON.stringify(lib.tools()));
console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha inventory: ${JSON.stringify(lib.inv())}, gear: ${JSON.stringify(lib.tools())}`);
