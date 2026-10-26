// programs/389-rapid-rearm.js
console.log('=== Program 389: Rapid Re-arm at Base ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Obtain stone_pickaxe (handles wood -> planks -> table -> wooden pickaxe -> stone)
console.log('Obtaining stone_pickaxe x2...');
try {
  const r = await lib.obtain('stone_pickaxe', 2);
  console.log('Stone pickaxe obtained! Steps:', r.steps?.join(' -> '));
} catch (e) {
  console.log('Pickaxe obtain note:', e.message);
}

// 2. Obtain stone_sword
console.log('Obtaining stone_sword...');
try {
  const r = await lib.obtain('stone_sword', 1);
  console.log('Stone sword obtained!');
} catch (e) {
  console.log('Sword obtain note:', e.message);
}

// 3. Collect 32 cobblestone for building & bridging
console.log('Collecting 32 cobblestone...');
try {
  await lib.collect('cobblestone', 32);
} catch (e) {
  console.log('Cobblestone collect note:', e.message);
}

// 4. Obtain food
if (bot.food < 18 || lib.count('cooked_*') < 3) {
  console.log('Obtaining cooked food...');
  try {
    await lib.obtain('cooked_beef', 4);
  } catch (e) {
    console.log('Food obtain note:', e.message);
  }
}

// 5. Equip weapons
await lib.equipArmor();
await lib.equipWeapon();

bot.chat(`team: Alpha rapidly re-armed! Tools: ${JSON.stringify(lib.tools())}, Cobble: ${lib.count('cobblestone')}, Food: ${lib.count('cooked_*')}. Ready to return to Nether!`);

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
