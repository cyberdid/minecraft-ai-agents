// programs/375-inspect-base-inventory.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Check nearby chests
const chestPositions = [
  new Vec3(293, 72, -57),
  new Vec3(294, 72, -57),
  new Vec3(293, 72, -58),
  new Vec3(292, 72, -57)
];

for (const p of chestPositions) {
  const b = bot.blockAt(p);
  if (b && (b.name === 'chest' || b.name === 'trapped_chest' || b.name === 'barrel')) {
    console.log(`Found ${b.name} at ${lib.fmt(p)}:`);
    try {
      const chest = await bot.openContainer(b);
      const items = chest.containerItems();
      for (const item of items) {
        console.log(`  ${item.name} x${item.count}`);
      }
      chest.close();
    } catch (e) {
      console.log(`  Failed to open: ${e.message}`);
    }
  }
}

// 2. Check nearby dropped item entities
const itemsOnGround = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 20);
console.log(`Ground items nearby (${itemsOnGround.length}):`);
for (const e of itemsOnGround) {
  console.log(`  Item at ${lib.fmt(e.position)}`);
}

// Try picking up ground items
if (itemsOnGround.length > 0) {
  const picked = await lib.pickup(15);
  console.log(`Picked up ${picked} items.`);
}

// 3. Print inventory
console.log('Current inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
