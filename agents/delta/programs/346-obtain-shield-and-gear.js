// programs/346-obtain-shield-and-gear.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'time:', bot.time.timeOfDay);

bot.chat('delta: Crafting shield, stone tools and gathering building blocks to assault Blaze Spawner!');

// 1. Obtain shield
console.log('Obtaining shield...');
try {
  const r = await lib.obtain('shield', 1);
  console.log('Obtained shield! Steps:');
  console.log(r.steps.join('\n'));
} catch (e) {
  console.log('Obtain shield note:', e.message);
}

// 2. Obtain stone sword
if (lib.count('stone_sword') < 1 && lib.count('iron_sword') < 1) {
  console.log('Obtaining stone_sword...');
  try {
    const r = await lib.obtain('stone_sword', 1);
    console.log('Obtained stone_sword!');
  } catch (e) {
    console.log('Obtain sword note:', e.message);
  }
}

// 3. Collect 32 cobblestone for spawner battlements enclosure
if (lib.count('cobblestone') < 32) {
  const needed = 32 - lib.count('cobblestone');
  console.log(`Collecting ${needed} cobblestone for blast fortifications...`);
  try {
    await lib.collect('cobblestone', needed);
    console.log('Cobblestone count now:', lib.count('cobblestone'));
  } catch (e) {
    console.log('Collect cobblestone note:', e.message);
  }
}

// 4. Equip armor and shield
try {
  await lib.equipArmor();
  console.log('Equipped armor and shield!');
} catch (e) {
  console.log('Equip armor note:', e.message);
}

// Ensure shield is in offhand and sword in main hand
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield) {
  try { await bot.equip(shield, 'off-hand'); console.log('Shield locked in off-hand!'); } catch (e) {}
}
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) {
  try { await bot.equip(sword, 'hand'); console.log('Sword equipped in main hand!'); } catch (e) {}
}

console.log('Rearmed Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

bot.chat(`delta: Fully geared! Shield in off-hand, ${lib.count('*_sword')} sword, ${lib.count('cobblestone')} cobble. Ready for Spawner breach!`);
