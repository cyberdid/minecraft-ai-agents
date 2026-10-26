// programs/396-collect-drops-and-return-to-base.js
console.log('=== Step: Collect drops and return to base with raw iron ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Collect all nearby item drops
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 10
);
console.log(`Nearby drops (${drops.length}):`);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
  } catch (e) {}
}
console.log(`Collected drops! raw_iron in inventory: ${lib.count('raw_iron')}`);

// 2. Ascend back up to the surface in stages
const ascentWaypoints = [
  new Vec3(353, 34, -36),
  new Vec3(349, 57, -36),
  new Vec3(350, 61, -35),
  new Vec3(330, 66, -42),
  new Vec3(310, 70, -48),
  new Vec3(296, 72, -52)
];

for (const wp of ascentWaypoints) {
  if (isCancelled()) break;
  console.log(`Heading towards ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2);
    console.log(`Reached near ${lib.fmt(wp)}, pos=${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Ascent error to ${lib.fmt(wp)}:`, err.message);
  }
}

// 3. Enter base door (294, 72, -54)
console.log('Entering base through door at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door entry error:', e.message);
}

// 4. Report status
console.log(`Beta back at base. raw_iron=${lib.count('raw_iron')}, coal=${lib.count('coal')}, pos=${lib.fmt(bot.entity.position)}`);
bot.chat(`beta: Returned to base! Carrying ${lib.count('raw_iron')} raw iron and ${lib.count('coal')} coal. Loading base furnaces!`);
