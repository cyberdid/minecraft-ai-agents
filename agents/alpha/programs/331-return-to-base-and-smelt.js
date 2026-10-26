// programs/331-return-to-base-and-smelt.js
console.log('=== Program 331: Return to Base & Smelt 14 Iron ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Walk remaining distance to base door
console.log('Walking to base door (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -54, 2, { timeoutMs: 25000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Walk to base note:', e.message);
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

// 2. Smelt 14 raw iron in base furnaces
const rawCount = lib.count('raw_iron');
const coalCount = lib.count('coal');
console.log(`Ready to smelt: ${rawCount} raw_iron with ${coalCount} coal at base furnaces...`);

if (rawCount > 0 && coalCount > 0) {
  try {
    const res = await lib.smelt('raw_iron', 'coal', rawCount);
    console.log('Smelt complete! Result:', JSON.stringify(res));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

console.log('Alpha inventory after smelting:', JSON.stringify(lib.inv()));

// 3. Craft iron gear at base table (295, 72, -56)
const iron = lib.count('iron_ingot');
console.log(`Have ${iron} iron ingots! Crafting gear...`);

if (iron >= 8) {
  try {
    await lib.craft('iron_chestplate', 1);
    console.log('Crafted iron_chestplate!');
  } catch (e) { console.log('Chestplate note:', e.message); }
}

if (lib.count('iron_ingot') >= 3) {
  try {
    await lib.craft('iron_pickaxe', 1);
    console.log('Crafted iron_pickaxe!');
  } catch (e) { console.log('Pickaxe note:', e.message); }
}

if (lib.count('iron_ingot') >= 2) {
  try {
    await lib.craft('iron_sword', 1);
    console.log('Crafted iron_sword!');
  } catch (e) { console.log('Sword note:', e.message); }
}

if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  try {
    await lib.craft('shield', 1);
    console.log('Crafted shield!');
  } catch (e) { console.log('Shield note:', e.message); }
}

// 4. Equip armor and weapon
await lib.equipArmor();
await lib.equipWeapon();

console.log('Alpha gear equipped! Gear:', JSON.stringify(lib.tools()));
console.log('Alpha final inv:', JSON.stringify(lib.inv()));
bot.chat(`team: Alpha crafted iron gear and shield! Gear: ${JSON.stringify(lib.tools())}`);
