// programs/412-check-surroundings-and-drops.js
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check nearby items on ground
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) <= 20);
console.log('Nearby dropped items count:', items.length);
for (const it of items) {
  console.log(`Item at ${lib.fmt(it.position)}: dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}`);
}

// 2. Check nearby chests
const chests = bot.findBlocks({ matching: b => b && b.name.includes('chest'), maxDistance: 30 });
console.log('Chests found:', chests.map(p => lib.fmt(p)).join(', ') || 'none');

// 3. Check teammates nearby
const teammates = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
for (const tm of teammates) {
  console.log(`Teammate ${tm.username} at ${lib.fmt(tm.entity.position)} (dist=${bot.entity.position.distanceTo(tm.entity.position).toFixed(1)})`);
}

// 4. Check mobs nearby
const hostiles = Object.values(bot.entities).filter(e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) <= 24);
console.log('Hostiles within 24m:', hostiles.map(h => `${h.name} at ${lib.fmt(h.position)} (HP=${h.health})`).join(', ') || 'none');
