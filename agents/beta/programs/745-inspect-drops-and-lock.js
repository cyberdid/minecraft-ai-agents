// programs/745-inspect-drops-and-lock.js
console.log('=== Program 745: Inspect Drops & Entities ===');
console.log('Beta at', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Check all items on ground within 16m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 16);
console.log(`Found ${items.length} items on ground:`);
for (const it of items) {
  console.log(` - Item #${it.id} at ${lib.fmt(it.position)}, dist: ${bot.entity.position.distanceTo(it.position).toFixed(2)}m`);
}

// Check all blazes within 16m
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze' && e.isValid);
console.log(`Found ${blazes.length} blazes nearby:`);
for (const b of blazes) {
  const d = bot.entity.position.distanceTo(b.position).toFixed(2);
  console.log(` - Blaze #${b.id} at ${lib.fmt(b.position)}, dist: ${d}m`);
}

// Check nearby experience orbs
const orbs = Object.values(bot.entities).filter(e => e.name === 'experience_orb' && bot.entity.position.distanceTo(e.position) <= 16);
console.log(`Found ${orbs.length} experience orbs nearby`);

return {
  items: items.length,
  blazes: blazes.length,
  orbs: orbs.length
};
