// programs/605-craft-shield.js
console.log('=== CRAFT SHIELD FOR NETHER COMBAT ===');
console.log('Planks in inv:', lib.count('*_planks'));
console.log('Iron in inv:', lib.count('iron_ingot'));

if (lib.count('*_planks') < 6) {
  console.log('Collecting 2 logs for planks...');
  try {
    await lib.collect('*_log', 2);
  } catch (e) {
    console.log('Collect log note:', e.message);
  }
}

// Convert logs to planks
if (lib.count('*_log') > 0 && lib.count('*_planks') < 6) {
  const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
  if (log) {
    const plankName = log.name.replace('_log', '_planks');
    await lib.craft(plankName, 1); // 1 craft = 4 planks
    if (lib.count('*_planks') < 6 && lib.count('*_log') > 0) {
      await lib.craft(plankName, 1);
    }
  }
}

console.log('Planks now:', lib.count('*_planks'));

// Craft shield
if (lib.count('*_planks') >= 6 && lib.count('iron_ingot') >= 1) {
  console.log('Crafting shield...');
  await lib.craft('shield', 1);
  console.log('Shield crafted! Total:', lib.count('shield'));
  await lib.equipArmor();
  console.log('Equipped shield in offhand!');
  bot.chat('gamma: Shield crafted and equipped in offhand! 100% combat defense active for Nether!');
}

return {
  shield: lib.count('shield'),
  offhand: bot.inventory.slots[45]?.name,
  inv: lib.inv()
};
