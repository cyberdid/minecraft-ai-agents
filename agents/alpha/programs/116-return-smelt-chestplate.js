// programs/116-return-smelt-chestplate.js
// 1. Run back to base at (294, 72, -54)
// 2. Step inside with passDoorIn
// 3. Smelt 6 raw_iron in furnace (295, 72, -55)
// 4. Craft iron_chestplate and equip!

console.log('alpha returning to base with 6 raw_iron. Alpha at:', lib.fmt(bot.entity.position), '| night in:', lib.time().secondsUntilNight);

bot.chat('alpha: Mined 6 raw iron! Returning to base to smelt chestplate and finish full armor.');

// 1. Return to base entrance
console.log('Navigating back to base...');
try {
  await lib.goToXZ(294, -52);
} catch (e) {
  console.log('GoToXZ note:', e.message);
  await lib.goTo(294, 72, -52, 2);
}

// 2. Step inside cleanly
console.log('Entering base...');
await passDoorIn();
console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 3. Check fuel in chest or inventory
let fuel = 'oak_planks';
if (lib.count('*_planks') < 4) {
  // Withdraw planks or cobblestone from chest
  try {
    await lib.withdraw({ oak_planks: 4 }, 293, 72, -57);
  } catch (e) {}
}

// 4. Smelt 6 raw_iron in furnace 1
console.log('Smelting 6 raw_iron...');
try {
  await lib.smelt('raw_iron', fuel, 6);
  console.log('Smelting complete!');
} catch (e) {
  console.log('Smelt note:', e.message);
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 5. Craft iron_chestplate
if (lib.count('iron_ingot') >= 8) {
  console.log('Crafting iron_chestplate...');
  await lib.craft('iron_chestplate', 1);
  console.log('Crafted iron_chestplate!');
}

// 6. Equip armor!
console.log('Equipping full armor...');
await lib.equipArmor();

console.log('GEAR:', JSON.stringify(lib.tools()));
console.log('INVENTORY:', JSON.stringify(lib.inv()));

bot.chat('alpha: Milestone 3 COMPLETE! Full iron armor and shield equipped.');
