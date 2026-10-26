// programs/458-check-ground-and-alert.js
console.log('=== Step: Check Ground Drops & Alert Team ===');

// Check all items on ground within 8m
const items = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
console.log(`Items within 8m (${items.length}):`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)}, metadata:`, JSON.stringify(it.metadata));
  try {
    await lib.goTo(it.position.x, it.position.y, it.position.z, 0.5);
    console.log(`Collected item at ${lib.fmt(it.position)}!`);
  } catch (e) {
    console.log(`Failed to collect item:`, e.message);
  }
}

// Alert team about spawner
bot.chat('team: BLAZE SPAWNER CONFIRMED AT (32, 68, -190)! It is at y=68 (balcony), NOT y=54! We need food and armor before engaging!');

console.log('Inv now:', JSON.stringify(lib.inv()), 'HP:', bot.health, 'Food:', bot.food);
