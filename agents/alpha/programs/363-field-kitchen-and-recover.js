// programs/363-field-kitchen-and-recover.js
console.log('=== Program 363: Field Kitchen & Complete Recovery ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Craft birch_planks from birch_log (in 2x2 inventory grid)
if (lib.count('birch_log') > 0 && lib.count('*_planks') < 4) {
  console.log('Crafting birch planks from birch log...');
  try {
    await lib.craft('birch_planks', 4);
    console.log('Planks now:', lib.count('*_planks'));
  } catch (e) {
    console.log('Craft planks error:', e.message);
  }
}

// 2. Craft crafting_table (in 2x2 inventory grid)
if (lib.count('crafting_table') === 0 && lib.count('*_planks') >= 4) {
  console.log('Crafting crafting table...');
  try {
    await lib.craft('crafting_table', 1);
    console.log('Crafting table count:', lib.count('crafting_table'));
  } catch (e) {
    console.log('Craft table error:', e.message);
  }
}

// 3. Craft furnace (8 cobblestone at crafting table)
if (lib.count('furnace') === 0) {
  console.log('Crafting furnace with 8 cobblestone...');
  try {
    await lib.craft('furnace', 1);
    console.log('Furnace crafted! Count:', lib.count('furnace'));
  } catch (e) {
    console.log('Craft furnace error:', e.message);
  }
}

// 4. Smelt 7 beef using 1 coal
console.log('Smelting 7 beef with coal...');
try {
  const result = await lib.smelt('beef', 'coal', lib.count('beef'));
  console.log('Smelt result:', JSON.stringify(result));
} catch (e) {
  console.log('Smelt error:', e.message);
}

// 5. Eat cooked beef until food is 20
console.log('Cooked beef in inv:', lib.count('cooked_beef'));
while (bot.food < 20 && lib.count('cooked_beef') > 0) {
  console.log(`Food is ${bot.food}/20. Eating cooked_beef...`);
  const ate = await globalThis.safeEat('cooked_beef');
  if (!ate) {
    try {
      await lib.eat();
    } catch (e) {
      console.log('lib.eat error:', e.message);
      break;
    }
  }
  console.log(`Food now: ${bot.food}/20, Health: ${bot.health}/20`);
}

// 6. Recover placed furnace and crafting table if nearby
const nearbyFurnace = bot.findBlock({ matching: mcData.blocksByName.furnace.id, maxDistance: 6 });
if (nearbyFurnace) {
  console.log('Harvesting furnace back into inventory...');
  try {
    await lib.dig(nearbyFurnace.position.x, nearbyFurnace.position.y, nearbyFurnace.position.z);
    await lib.pickup(4);
  } catch (e) {}
}

const nearbyTable = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 6 });
if (nearbyTable) {
  console.log('Harvesting crafting table back into inventory...');
  try {
    await lib.dig(nearbyTable.position.x, nearbyTable.position.y, nearbyTable.position.z);
    await lib.pickup(4);
  } catch (e) {}
}

// 7. Regenerate health towards 20
console.log('Waiting for initial health regen...');
for (let i = 0; i < 10 && bot.health < 20; i++) {
  if (isCancelled()) break;
  await sleep(1500);
}

console.log('Alpha recovered! Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
bot.chat(`team: Alpha field kitchen successful! Health: ${bot.health}/20, Food: ${bot.food}/20, cooked_beef: ${lib.count('cooked_beef')}`);
