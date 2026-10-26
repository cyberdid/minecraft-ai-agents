// programs/285-find-skeleton.js
console.log('=== Program 285: Find Skeleton ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position));

const mobs = Object.values(bot.entities).filter(e => e.type === 'hostile' && bot.entity.position.distanceTo(e.position) < 12);
for (const m of mobs) {
  const d = bot.entity.position.distanceTo(m.position);
  console.log(`Nearby hostile: ${m.name} at ${lib.fmt(m.position)}, dist=${d.toFixed(1)}m`);
}
