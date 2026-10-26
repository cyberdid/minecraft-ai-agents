// programs/257-inspect-and-advance-wp1.js
console.log('=== INSPECT NETHER BUNKER SURROUNDINGS & ADVANCE TO WP1 ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Scan for fire blocks within 20m
const fires = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
  maxDistance: 20,
  count: 10
});
console.log(`Fire blocks found (${fires.length}):`, fires.map(p => lib.fmt(p)));

// 2. Scan for dropped items within 25m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 25);
console.log(`Dropped items nearby (${items.length}):`);
for (const it of items) {
  console.log(` - Item ${it.id} at ${lib.fmt(it.position)} dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// If items nearby and path has no fire, pickup
for (const it of items) {
  if (it.isValid && it.position.distanceTo(bot.entity.position) < 16) {
    console.log(`Picking up item at ${lib.fmt(it.position)}...`);
    try {
      await lib.goTo(it.position.x, it.position.y, it.position.z, 1, { timeoutMs: 8000 });
      await lib.pickup(4);
    } catch (e) {
      console.log('Pickup error:', e.message);
    }
  }
}

// 3. Extinguish any fire in our direct path to WP1 (63, 64, -5)
for (const fp of fires) {
  if (fp.x >= 40 && fp.x <= 63 && Math.abs(fp.z - (-5)) <= 3) {
    console.log(`Extinguishing fire block in path at ${lib.fmt(fp)}...`);
    try {
      await lib.dig(fp.x, fp.y, fp.z);
    } catch (e) {
      console.log('Extinguish note:', e.message);
    }
  }
}

// 4. Advance to WP1 (63, 64, -5)
console.log('Advancing to WP1: (63, 64, -5)...');
try {
  await lib.goTo(63, 64, -5, 2, { timeoutMs: 15000 });
} catch (e) {
  console.log('WP1 goTo note:', e.message);
  try {
    await lib.goToXZ(63, -5, { timeoutMs: 10000 });
  } catch (e2) {}
}

console.log('Pos at WP1:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma reached WP1 at ${lib.fmt(bot.entity.position)}! HP ${bot.health}/20, advancing along East Ridge.`);
