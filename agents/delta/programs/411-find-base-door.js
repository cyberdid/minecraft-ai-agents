// programs/411-find-base-door.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

const doorIds = Object.keys(mcData.blocksByName).filter(k => k.endsWith('_door')).map(k => mcData.blocksByName[k].id);
const doors = bot.findBlocks({ matching: doorIds, maxDistance: 12, count: 5 });

console.log(`Found ${doors.length} doors:`);
for (const dPos of doors) {
  const b = bot.blockAt(dPos);
  console.log(`  ${b.name} at ${lib.fmt(dPos)}`);
}

// Find path from here to the portal block at (299, 73, -54)
const portalBlock = new Vec3(299, 73, -54);
console.log('Pathfinding to (299, 73, -54)...');
try {
  await lib.goTo(portalBlock.x, portalBlock.y, portalBlock.z, 0.5, { dig: false, timeoutMs: 10000 });
  console.log('Successfully reached portal block! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goTo portal failed:', e.message);
}
