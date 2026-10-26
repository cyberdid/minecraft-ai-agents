// programs/080-check-equipment.js
const offhand = bot.inventory.slots[45];
console.log('Offhand item:', offhand ? `${offhand.name} x${offhand.count}` : 'empty');

for (let i = 5; i <= 8; i++) {
  const item = bot.inventory.slots[i];
  console.log(`Armor slot ${i}:`, item ? `${item.name}` : 'empty');
}

console.log('Cursor item:', bot.inventory.selectedItem?.name || bot.currentEquippedItem?.name);
