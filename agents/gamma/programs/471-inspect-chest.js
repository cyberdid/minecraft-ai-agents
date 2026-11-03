// programs/471-inspect-chest.js
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (!chestBlock) {
  console.log('No chest at 293, 72, -57');
  return;
}
const chest = await bot.openContainer(chestBlock);
console.log('Chest contents:');
for (const item of chest.containerItems()) {
  console.log(`- ${item.name} x${item.count}`);
}
// If there is a shield or iron_ingot or food, withdraw what is useful
const shieldItem = chest.containerItems().find(i => i.name === 'shield');
if (shieldItem) {
  await chest.withdraw(shieldItem.type, null, 1);
  console.log('Withdrew shield from chest');
}
const ironItem = chest.containerItems().find(i => i.name === 'iron_ingot');
if (!shieldItem && ironItem && lib.count('shield') === 0) {
  // withdraw 1 iron to craft shield if we have wood
  await chest.withdraw(ironItem.type, null, Math.min(3, ironItem.count));
  console.log('Withdrew iron for shield');
}
const foodItem = chest.containerItems().find(i => ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple'].includes(i.name));
if (foodItem && lib.count('*cooked*') === 0 && lib.count('bread') === 0) {
  await chest.withdraw(foodItem.type, null, Math.min(8, foodItem.count));
  console.log('Withdrew food:', foodItem.name);
}
chest.close();

// Equip shield in offhand if present
const myShield = bot.inventory.items().find(i => i.name === 'shield');
if (myShield) {
  await bot.equip(myShield, 'off-hand');
  console.log('Equipped shield in off-hand!');
}

return { inv: lib.inv(), held: bot.heldItem?.name, offhand: bot.inventory.slots[45]?.name };
