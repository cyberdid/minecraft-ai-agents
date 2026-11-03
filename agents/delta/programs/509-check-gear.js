// programs/509-check-gear.js
globalThis.isProgramCancelled = isCancelled;

const offhand = bot.inventory.slots[45];
console.log('Offhand slot 45:', offhand ? `${offhand.name} x${offhand.count}` : 'empty');

const armorSlots = [5, 6, 7, 8];
const armorNames = ['helmet', 'chestplate', 'leggings', 'boots'];
for (let i = 0; i < 4; i++) {
  const item = bot.inventory.slots[armorSlots[i]];
  console.log(`Armor ${armorNames[i]} (slot ${armorSlots[i]}):`, item ? `${item.name} (durability: ${item.durabilityUsed || 0})` : 'empty');
}

return {
  offhand: offhand ? offhand.name : null,
  armor: armorSlots.map(s => bot.inventory.slots[s]?.name || null)
};
