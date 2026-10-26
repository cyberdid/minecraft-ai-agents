// programs/255-mine-near-iron-and-coal.js
console.log('=== Step 13: Mine shallow iron ore and coal ore ===');
console.log('Starting pos:', lib.fmt(bot.entity.position));

// 1. Walk towards iron ore at (301, y, -21)
console.log('Walking towards (301, 71, -21)...');
await lib.goTo(301, 71, -21, 2, { timeoutMs: 25000 });
console.log('Near iron ore spot. Beta at:', lib.fmt(bot.entity.position));

// Equip stone pickaxe
await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');

// Collect iron ore
try {
  console.log('Collecting iron ore...');
  const gotIron = await lib.collect(['iron_ore', 'deepslate_iron_ore'], 4);
  console.log('Collected iron:', JSON.stringify(gotIron));
} catch (e) {
  console.log('Iron collect note:', e.message);
}

// 2. Walk towards coal ore at (293, 71, -44)
console.log('Walking towards coal ore at (293, 71, -44)...');
await lib.goTo(293, 71, -44, 2, { timeoutMs: 25000 });
console.log('Near coal ore spot. Beta at:', lib.fmt(bot.entity.position));

// Collect coal ore
try {
  console.log('Collecting coal ore...');
  const gotCoal = await lib.collect(['coal_ore', 'deepslate_coal_ore'], 6);
  console.log('Collected coal:', JSON.stringify(gotCoal));
} catch (e) {
  console.log('Coal collect note:', e.message);
}

// 3. Return to base
console.log('Returning to base at (294, 72, -54)...');
await lib.goTo(294, 72, -53, 1, { timeoutMs: 20000 });
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {
  console.log('Door note:', e.message);
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Time until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Returned to base with raw_iron: ${lib.count('raw_iron')}, coal: ${lib.count('coal')}. Time: ${lib.time().secondsUntilNight}s until night.`);
