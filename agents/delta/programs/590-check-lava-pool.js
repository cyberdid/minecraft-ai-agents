console.log('=== CHECK LAVA POOL AT (333, 62, -78) ===');
const lavaBlocks = bot.findBlocks({ matching: b => b && b.name === 'lava', maxDistance: 16, count: 20 });
console.log(`Found ${lavaBlocks.length} lava blocks nearby:`, lavaBlocks.map(p => lib.fmt(p)));

// Check dropped items nearby
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 16);
console.log('Nearby dropped items:', items.map(i => `${lib.fmt(i.position)}`));
