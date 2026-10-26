// programs/560-craft-and-mine-overworld.js
console.log('=== Program 560: Craft Stone Pickaxe & Gather Cobblestone ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Current inv:', lib.inv());

// We have 3 planks, 3 cobble, 2 sticks, wooden pickaxe.
// Need 1 more log for extra planks/crafting table if needed.
if (lib.count('*_planks') < 4 && lib.count('*_log') === 0) {
  console.log('Collecting 1 log...');
  try {
    await lib.collect('*_log', 1);
  } catch (e) {
    console.log('Collect log note:', e.message);
  }
}

// Craft stone pickaxe
console.log('Crafting stone_pickaxe...');
await lib.obtain('stone_pickaxe', 1);

// Mine 16 cobblestone
console.log('Mining 16 cobblestone...');
try {
  await lib.collect('cobblestone', 16);
} catch (e) {
  console.log('Collect cobble note:', e.message);
}

// Craft stone swords
console.log('Crafting stone swords...');
try {
  await lib.craft('stone_sword', 2);
} catch (e) {
  console.log('Craft stone sword note:', e.message);
}

await lib.equipWeapon();
console.log('Ready! Inv:', lib.inv());
bot.chat(`alpha: Geared up with stone tools & ${lib.count('cobblestone')} cobble! Heading to Nether portal!`);
