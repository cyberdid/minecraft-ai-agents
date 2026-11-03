// programs/414-obtain-shield.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'food:', bot.food);

// 1. Obtain shield (6 planks + 1 iron ingot)
console.log('Obtaining shield via lib.obtain...');
try {
  const result = await lib.obtain('shield', 1);
  console.log('Obtain shield result:', JSON.stringify(result));
} catch (e) {
  console.log('Obtain shield note:', e.message);
}

// 2. Equip shield in offhand
try {
  await lib.equipArmor();
  console.log('Armor & offhand equipped!');
} catch (e) {}

// 3. Obtain stone sword if missing
if (lib.count('*_sword') === 0) {
  try {
    await lib.obtain('stone_sword', 1);
    console.log('Stone sword obtained!');
  } catch (e) {}
}

try { await lib.equipWeapon(); } catch (e) {}

console.log('Inventory after shield acquisition:');
for (const item of bot.inventory.items()) console.log(`  ${item.name} x${item.count}`);

const offhand = bot.inventory.slots[45];
console.log('Offhand item:', offhand?.name, 'Held item:', bot.heldItem?.name);
