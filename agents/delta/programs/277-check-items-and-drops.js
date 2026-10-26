// programs/277-check-items-and-drops.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

const drops = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 25);
console.log(`Found ${drops.length} dropped item stacks nearby:`);
for (const d of drops) {
  console.log(`  item at ${lib.fmt(d.position)} (dist: ${bot.entity.position.distanceTo(d.position).toFixed(1)}m)`);
}
