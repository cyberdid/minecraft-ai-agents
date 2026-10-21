function getBlueprint() {
  return lib.shapes.house({
    x: 10,
    y: 67,
    z: -25,
    width: 5,
    depth: 5,
    height: 3,
    wall: 'sandstone',
    roof: 'oak_planks',
    door: 'south',
    windows: true
  });
}

globalThis.getBlueprint = getBlueprint;
const bp = getBlueprint();
console.log('Blueprint total blocks:', bp.length);

console.log('Walking to base at (10, 67, -25)...');
await lib.goTo(10, 67, -25, 2);
console.log('Arrived at base! Bot at:', lib.fmt(bot.entity.position));

const alpha = bot.players.alpha?.entity;
console.log('Alpha pos:', alpha ? lib.fmt(alpha.position) : 'unknown');

// Check materials status of blueprint
const mats = lib.materials(bp);
console.log('Blueprint materials needed:', JSON.stringify(mats.need));
console.log('Materials missing from beta inv:', JSON.stringify(mats.missing));

// Inspect what is currently placed at the house site
let placedCount = 0;
for (const b of bp) {
  const cur = bot.blockAt(new Vec3(b.x, b.y, b.z));
  if (cur && cur.name === b.name) placedCount++;
}
console.log(`House progress: ${placedCount} / ${bp.length} blocks placed`);

bot.chat(`alpha: I am at base! House progress: ${placedCount}/${bp.length} blocks. Need ${mats.need.sandstone || 0} sandstone, ${mats.need.oak_planks || 0} planks.`);

return { placedCount, total: bp.length, need: mats.need };
