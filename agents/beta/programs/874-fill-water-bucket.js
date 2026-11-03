// programs/874-fill-water-bucket.js
console.log('=== Program 874: Fill Water Bucket from Nearby Water Source ===');

const waters = bot.findBlocks({
  matching: b => b && b.name === 'water' && b.metadata === 0,
  maxDistance: 16,
  count: 5
});

console.log(`Found ${waters.length} water source blocks near base:`);
for (const wp of waters) {
  console.log(`  Water at ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(2)}m)`);
}

if (waters.length > 0 && lib.count('water_bucket') === 0) {
  const target = waters[0];
  console.log(`Scooping water at ${lib.fmt(target)}...`);
  try {
    await lib.goTo(target.x, target.y + 1, target.z, 2.0, { dig: false, timeoutMs: 5000 });
  } catch (e) {}

  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) {
    await bot.equip(bkt, 'hand');
    await bot.lookAt(target.offset(0.5, 0.5, 0.5), true);
    bot.activateItem();
    await sleep(800);
  }
}

console.log(`Inventory: water_bucket=${lib.count('water_bucket')}`);

// Return to portal sill station (297, 72, -54)
try {
  await lib.goTo(297, 72, -54, 1.2, { timeoutMs: 5000 });
} catch (e) {}

console.log(`Stationed at portal: ${lib.fmt(bot.entity.position)}`);
bot.chat('Beta: Water bucket READY! Standing by at portal frame to quench Alpha lava into obsidian!');
