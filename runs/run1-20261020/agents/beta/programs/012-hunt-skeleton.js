console.log('Bot pos:', bot.entity.position);
const mobs = Object.values(bot.entities).filter(e => e && e.type === 'mob');
console.log(`Found ${mobs.length} mob(s):`);
for (const m of mobs) {
  console.log(`- ${m.name} at ${m.position.floored()} (dist: ${m.position.distanceTo(bot.entity.position).toFixed(1)})`);
}

// Find item drops
const items = Object.values(bot.entities).filter(e => e && e.name === 'item');
console.log(`Found ${items.length} item drop(s) in world.`);
for (const it of items.slice(0, 10)) {
  console.log(`- item at ${it.position.floored()} (dist: ${it.position.distanceTo(bot.entity.position).toFixed(1)})`);
}

return { mobs: mobs.length, items: items.length };
