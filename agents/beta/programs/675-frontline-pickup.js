console.log('=== Frontline Scout at (43.5, 67.0, -175.0) ===');
console.log('Pos:', bot.entity.position, 'HP:', bot.health, 'Food:', bot.food);

// Check all dropped items within 16m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 16);
console.log(`Found ${items.length} dropped item entities nearby:`);
for (const it of items) {
  console.log(`  id=${it.id}, pos=${lib.fmt(it.position)}, dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// Pickup nearby items
const gained = await lib.pickup(8);
console.log('Gained items:', gained);
console.log('Current inv:', JSON.stringify(lib.inv()));

// Equip armor if picked up
await lib.equipArmor();
await lib.equipWeapon();

// Check if any Blaze rods were picked up
console.log('Blaze rods:', lib.count('blaze_rod'));
