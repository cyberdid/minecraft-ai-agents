// programs/407-find-base-door.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

const doorIds = Object.keys(mcData.blocksByName).filter(k => k.endsWith('_door')).map(k => mcData.blocksByName[k].id);
const doors = bot.findBlocks({
  matching: doorIds,
  maxDistance: 16,
  count: 5
});

console.log(`Found ${doors.length} doors:`);
for (const d of doors) {
  const b = bot.blockAt(d);
  console.log(`  ${b.name} at ${lib.fmt(d)} dist: ${bot.entity.position.distanceTo(d).toFixed(1)}m`);
}
