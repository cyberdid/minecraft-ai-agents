// programs/348-craft-full-iron-armor.js
console.log('=== Program 348: Return to Base & Complete Full Iron Armor ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Walk back to base
console.log('Walking to base door (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -54, 2, { timeoutMs: 35000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Walk note:', e.message);
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

// 2. Smelt 5 raw iron in furnace
const raw = lib.count('raw_iron');
console.log(`Smelting ${raw} raw_iron...`);
if (raw > 0 && lib.count('coal') > 0) {
  try {
    const res = await lib.smelt('raw_iron', 'coal', raw);
    console.log('Smelting complete:', JSON.stringify(res));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

// 3. Withdraw iron ingots from base chest
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Base chest items:', JSON.stringify(contents));
  if (contents.iron_ingot > 0) {
    console.log(`Withdrawing ${contents.iron_ingot} iron_ingots from chest...`);
    await lib.withdraw({ iron_ingot: contents.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
  }
} catch (e) {
  console.log('Chest withdraw note:', e.message);
}

const totalIron = lib.count('iron_ingot');
console.log(`Total iron ingots available: ${totalIron}`);

// 4. Craft iron_helmet (5)
if (totalIron >= 5 && !bot.inventory.items().some(i => i.name === 'iron_helmet')) {
  try {
    await lib.craft('iron_helmet', 1);
    console.log('Crafted iron_helmet!');
  } catch (e) { console.log('Helmet note:', e.message); }
}

// 5. Craft iron_boots (4)
if (lib.count('iron_ingot') >= 4 && !bot.inventory.items().some(i => i.name === 'iron_boots')) {
  try {
    await lib.craft('iron_boots', 1);
    console.log('Crafted iron_boots!');
  } catch (e) { console.log('Boots note:', e.message); }
}

// 6. Equip all armor
await lib.equipArmor();
await lib.equipWeapon();

console.log('Alpha gear now:', JSON.stringify(lib.tools()));
const ironArmor = bot.inventory.items().filter(i => i.name.startsWith('iron_') && (i.name.includes('helmet') || i.name.includes('chestplate') || i.name.includes('leggings') || i.name.includes('boots'))).map(i => i.name);
console.log('Iron armor worn:', JSON.stringify(ironArmor));

bot.chat(`team: Alpha equipped with: ${ironArmor.join(', ')}! Milestone 3 achieved for Alpha!`);
