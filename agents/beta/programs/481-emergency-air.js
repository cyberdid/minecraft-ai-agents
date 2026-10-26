// programs/481-emergency-air.js
console.log('=== EMERGENCY: FIND AIR NOW ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health);

// 1. Scan for nearest air or cave_air
const airBlocks = bot.findBlocks({
  matching: b => b.name === 'air' || b.name === 'cave_air',
  maxDistance: 12,
  count: 10
});
console.log(`Air blocks nearby: ${airBlocks.length}`);

let reachedAir = false;
for (const ap of airBlocks) {
  console.log(`  Air at ${lib.fmt(ap)} dist=${bot.entity.position.distanceTo(ap).toFixed(1)}m`);
  try {
    await lib.goTo(ap.x, ap.y, ap.z, 0.5);
    console.log('REACHED AIR at', lib.fmt(bot.entity.position));
    reachedAir = true;
    break;
  } catch (e) {}
}

// 2. If no path to air, dig 2-high pocket into adjacent stone
if (!reachedAir) {
  console.log('Digging emergency air pocket into stone...');
  // Stone wall at (289, 49..50, -58)
  try {
    await lib.dig(289, 49, -58);
    await lib.dig(289, 50, -58);
    // Step into pocket
    await lib.goTo(289, 49, -58, 0.5);
    console.log('Stepped into air pocket!');
  } catch (e) {
    console.log('Dig pocket error:', e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position), 'Health:', bot.health);
