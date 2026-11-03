// programs/378-wood-stone-tools.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'food:', bot.food);

// 1. Collect 2 birch_log at (317, 70..72, -77)
console.log('Collecting birch logs at (317, 70..72, -77)...');
try {
  await lib.collect('birch_log', 2);
} catch (e) {
  console.log('lib.collect birch_log note:', e.message);
  // Manual chop fallback
  const logPos = new Vec3(317, 71, -77);
  await lib.goTo(logPos.x, logPos.y, logPos.z, 3);
  const b = bot.blockAt(logPos) || bot.blockAt(new Vec3(317, 70, -77));
  if (b) await bot.dig(b);
  await lib.pickup(4);
}

console.log('Inventory after wood gathering:');
for (const item of bot.inventory.items()) console.log(`  ${item.name} x${item.count}`);

// 2. Craft planks and sticks in player 2x2 grid
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  const planksName = logItem.name.replace('_log', '_planks');
  try {
    await lib.craft(planksName, 2); // 2 logs -> 8 planks
    console.log(`Crafted ${planksName}`);
  } catch (e) {
    console.log(`Failed crafting planks: ${e.message}`);
  }
}

if (lib.count('stick') < 4) {
  try {
    await lib.craft('stick', 4);
    console.log('Crafted sticks');
  } catch (e) {
    console.log(`Failed crafting sticks: ${e.message}`);
  }
}

// 3. Move to crafting table at (295, 72, -56)
console.log('Moving to crafting table at (295, 72, -56)...');
await lib.goTo(294, 72, -56, 1.5);

// 4. Craft stone_pickaxe
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe!');
  } catch (e) {
    console.log(`Failed crafting stone_pickaxe: ${e.message}`);
  }
}

// Equip pickaxe if crafted
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 5. Mine 12 cobblestone from nearby stone
console.log('Mining 12 stone/cobblestone...');
try {
  await lib.collect('cobblestone', 12);
} catch (e) {
  console.log('Collect cobblestone note:', e.message);
}

// 6. Return to crafting table and craft stone_sword
await lib.goTo(294, 72, -56, 1.5);
if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  } catch (e) {
    console.log(`Failed crafting stone_sword: ${e.message}`);
  }
}

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

console.log('Final inventory:');
for (const item of bot.inventory.items()) console.log(`  ${item.name} x${item.count}`);
