// programs/747-scan-and-vacuum.js
console.log('=== Program 747: Scan & Vacuum Balcony Drops ===');
console.log('Bot pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 12);
console.log(`Found ${items.length} item entities within 12m:`);

for (const it of items) {
  const d = bot.entity.position.distanceTo(it.position).toFixed(2);
  console.log(` - Item #${it.id} at ${lib.fmt(it.position)}, dist: ${d}m`);
  
  // Check if floor underneath is solid
  const floorBlock = bot.blockAt(it.position.offset(0, -0.5, 0));
  console.log(`   Floor under item: ${floorBlock?.name} at ${lib.fmt(floorBlock?.position)}`);
  
  // Safe vacuum if floor is solid
  if (floorBlock && floorBlock.boundingBox === 'block' && it.position.x >= 32.0 && it.position.z >= -191.0 && it.position.z <= -185.0) {
    console.log(`   Vacuuming item at ${lib.fmt(it.position)}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 0.5));
      await sleep(300);
    } catch (e) {
      console.log('   Goto error:', e.message);
    }
  }
}

// Return to safe firing stance (35.5, 66.0, -188.0)
try {
  await bot.pathfinder.goto(new goals.GoalNear(35.5, 66.0, -188.0, 0.4));
} catch (e) {}

console.log('Blaze rods now in inventory:', lib.count('blaze_rod'));
console.log('Final inventory:', lib.inv());

return {
  rods: lib.count('blaze_rod'),
  inv: lib.inv(),
  pos: bot.entity.position
};
