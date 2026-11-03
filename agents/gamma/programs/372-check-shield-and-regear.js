// programs/372-check-shield-and-regear.js
console.log('=== CHECK SHIELD & OFFHAND ===');
const offhand = bot.inventory.slots[45];
console.log('Offhand slot (45):', offhand ? `${offhand.name} x${offhand.count}` : 'empty');

// Search all inventory items
const allItems = bot.inventory.items();
console.log('All inventory items:', allItems.map(i => `${i.name} x${i.count} (slot ${i.slot})`).join(', '));

// If shield is in inventory but not in offhand:
const shieldItem = allItems.find(i => i.name === 'shield');
if (shieldItem) {
  console.log('Shield found in inventory! Equipping to offhand...');
  await bot.equip(shieldItem, 'off-hand');
} else if (!offhand || offhand.name !== 'shield') {
  console.log('Shield not in inventory or offhand! Check chest at (293, 72, -57) and nearby drops...');
  try {
    const chest = await lib.chestContents(293, 72, -57);
    console.log('Base chest:', JSON.stringify(chest));
    if (chest && chest.shield > 0) {
      await lib.withdraw({ shield: 1 }, 293, 72, -57);
      await bot.equip(mcData.itemsByName.shield.id, 'off-hand');
    }
  } catch (e) {}
}

await lib.equipWeapon();
console.log('Offhand now:', bot.inventory.slots[45]?.name);
console.log('Held now:', bot.heldItem?.name);
console.log('Tools/Gear:', JSON.stringify(lib.tools()));
