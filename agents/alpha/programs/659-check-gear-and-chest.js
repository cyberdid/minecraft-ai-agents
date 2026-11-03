// programs/659-check-gear-and-chest.js
console.log('Armor:', bot.inventory.slots.slice(5, 9).map(s => s?.name));
console.log('Offhand (45):', bot.inventory.slots[45]?.name);
console.log('Current inv:', lib.inv());

const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos) || bot.findBlock({ matching: b => b && b.name === 'chest', maxDistance: 10 });
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Chest at', chestBlock.position, 'contains:', chest.containerItems().map(i => `${i.name}x${i.count}`).join(', '));
    await chest.close();
  } catch (err) {
    console.log('Error opening chest:', err.message);
  }
} else {
  console.log('No chest found nearby');
}
