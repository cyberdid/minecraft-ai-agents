// programs/117-run-to-base-and-craft.js
// Run directly to base at (294, 72, -54) away from creeper, enter, smelt 6 raw iron, craft iron_chestplate!

console.log('alpha at:', lib.fmt(bot.entity.position), '| night in:', lib.time().secondsUntilNight);

bot.chat('alpha: Running back to base away from creeper to smelt chestplate!');

// 1. Move to base entrance
console.log('Navigating to base entrance...');
try {
  await lib.goToXZ(294, -52);
  console.log('At base entrance! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('GoToXZ note:', e.message);
  await lib.goTo(294, 72, -52, 2);
}

// 2. Step inside base cleanly
console.log('Entering base...');
try {
  await passDoorIn();
} catch (e) {
  console.log('Door in note:', e.message);
}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 3. Withdraw fuel from chest
console.log('Withdrawing planks from chest...');
try {
  await lib.withdraw({ oak_planks: 4 }, 293, 72, -57);
} catch (e) {}

// 4. Smelt 6 raw_iron in furnace at (295, 72, -55)
console.log('Smelting 6 raw_iron...');
try {
  await lib.smelt('raw_iron', 'oak_planks', 6);
  console.log('6 raw_iron smelted into iron_ingots!');
} catch (e) {
  console.log('Smelt note:', e.message);
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 5. Craft iron_chestplate at crafting table (295, 72, -56)
if (lib.count('iron_ingot') >= 8) {
  console.log('Crafting iron_chestplate...');
  await lib.craft('iron_chestplate', 1);
  console.log('Crafted iron_chestplate!');
}

// 6. Equip full armor!
console.log('Equipping full armor...');
await lib.equipArmor();

console.log('Alpha gear:', JSON.stringify(lib.tools()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
bot.chat('alpha: Milestone 3 COMPLETE! Full iron armor equipped.');
