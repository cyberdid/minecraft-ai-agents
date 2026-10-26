// programs/338-east-hill-fast-iron-mine.js
console.log('=== Program 338: Fast Iron Mining on East Hill ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Exit base
console.log('Exiting base to East hill...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door note:', e.message);
}

// 2. Travel to East hill (350, 55, -35)
bot.chat('team: Alpha heading to East hill (350, 55, -35) with iron_pickaxe to mine 16 iron ore for full armor!');
try {
  await lib.goTo(350, 55, -35, 3, { timeoutMs: 25000 });
  console.log('Arrived at East hill! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Travel note:', e.message);
}

// 3. Collect 16 iron ore using lib.collect (with iron_pickaxe equipped)
console.log('Collecting 16 iron_ore with iron pickaxe...');
try {
  const got = await lib.collect('iron_ore', 16);
  console.log('Collected iron ore:', JSON.stringify(got));
} catch (e) {
  console.log('Collect error:', e.message);
}

console.log('Raw iron in inventory:', lib.count('raw_iron'));

// 4. Return to base (294, 72, -54)
console.log('Returning to base...');
try {
  await lib.goTo(294, 72, -54, 2, { timeoutMs: 25000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Back inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Return note:', e.message);
}

// 5. Smelt iron ore in base furnace
const rawIron = lib.count('raw_iron');
const coal = lib.count('coal');
console.log(`Ready to smelt ${rawIron} raw_iron with ${coal} coal...`);
if (rawIron > 0 && coal > 0) {
  try {
    const res = await lib.smelt('raw_iron', 'coal', rawIron);
    console.log('Smelting complete! Result:', JSON.stringify(res));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

// 6. Craft remaining armor: leggings (7), helmet (5), boots (4)
const ingots = lib.count('iron_ingot');
console.log(`Iron ingots available: ${ingots}`);

if (ingots >= 7) {
  try { await lib.craft('iron_leggings', 1); console.log('Crafted iron_leggings!'); } catch (e) {}
}
if (lib.count('iron_ingot') >= 5) {
  try { await lib.craft('iron_helmet', 1); console.log('Crafted iron_helmet!'); } catch (e) {}
}
if (lib.count('iron_ingot') >= 4) {
  try { await lib.craft('iron_boots', 1); console.log('Crafted iron_boots!'); } catch (e) {}
}

// 7. Equip full armor
await lib.equipArmor();
await lib.equipWeapon();

console.log('Alpha gear now:', JSON.stringify(lib.tools()));
console.log('Armor worn:', bot.inventory.items().filter(i => i.name.startsWith('iron_')).map(i => i.name));
bot.chat(`team: Alpha status: ${JSON.stringify(lib.tools())}, wearing: ${bot.inventory.items().filter(i => i.name.startsWith('iron_')).map(i => i.name).join(', ')}`);
