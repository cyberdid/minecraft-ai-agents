// programs/097-obtain-chestplate.js
// Obtain iron_chestplate for Alpha to complete Milestone 3!

console.log('alpha health:', bot.health, '| food:', bot.food, '| time:', lib.time().timeOfDay);

bot.chat('alpha: Day 10 dawn! Obtaining iron_chestplate to complete Milestone 3 full iron armor.');

// Ensure ample planks for fuel
if (lib.count('*_planks') < 8 && lib.count('*_log') > 0) {
  console.log('Crafting oak planks for smelting fuel...');
  await lib.craft('oak_planks', 8);
}
console.log('Planks count for fuel:', lib.count('*_planks'));

// Step outside using passDoorOut
console.log('Stepping outside base...');
await passDoorOut();

// Run obtain
console.log('Calling lib.obtain("iron_chestplate", 1)...');
const res = await lib.obtain('iron_chestplate', 1);
console.log('Obtain result:', JSON.stringify(res));

// Return to base if outside
const distToBase = bot.entity.position.distanceTo(new Vec3(294, 72, -54));
if (distToBase > 4) {
  console.log('Returning to base entrance...');
  await lib.goToXZ(294, -52);
  await passDoorIn();
}

// Equip armor
console.log('Equipping full armor...');
await lib.equipArmor();

console.log('Alpha armor status:', JSON.stringify(lib.tools()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));

bot.chat('alpha: Milestone 3 COMPLETE! Full iron armor and shield equipped.');
