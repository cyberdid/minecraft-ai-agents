// programs/362-inspect-and-unstick.js
console.log('=== Program 362: Inspect Alpha Position and Surroundings ===');

const p = bot.entity.position;
console.log('Exact pos:', p, 'onGround:', bot.entity.onGround, 'isCollidedHorizontally:', bot.entity.isCollidedHorizontally);

const blockFeet = bot.blockAt(p);
const blockUnder = bot.blockAt(p.offset(0, -1, 0));
const blockHead = bot.blockAt(p.offset(0, 1, 0));
const blockAbove = bot.blockAt(p.offset(0, 2, 0));

console.log('Feet block:', blockFeet?.name);
console.log('Under feet block:', blockUnder?.name);
console.log('Head block:', blockHead?.name);
console.log('Above head block:', blockAbove?.name);

// Check 3x3 at feet level and head level
console.log('3x3 around feet (y=77):');
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    const b = bot.blockAt(p.offset(dx, 0, dz));
    console.log(`  (${dx}, 0, ${dz}): ${b?.name} (boundingBox: ${b?.boundingBox})`);
  }
}

console.log('3x3 around head (y=78):');
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    const b = bot.blockAt(p.offset(dx, 1, dz));
    console.log(`  (${dx}, 1, ${dz}): ${b?.name} (boundingBox: ${b?.boundingBox})`);
  }
}
