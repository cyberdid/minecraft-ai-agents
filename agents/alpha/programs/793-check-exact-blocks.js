// programs/793-check-exact-blocks.js
const p = bot.entity.position;
console.log('Pos:', p);
const feet = bot.blockAt(p);
const below = bot.blockAt(p.offset(0, -1, 0));
const head = bot.blockAt(p.offset(0, 1, 0));

console.log('feet block:', feet ? feet.name : 'null');
console.log('below block:', below ? below.name : 'null');
console.log('head block:', head ? head.name : 'null');

// Check 3x3 at y=30 and y=31
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    const b30 = bot.blockAt(p.offset(dx, -1, dz));
    const b31 = bot.blockAt(p.offset(dx, 0, dz));
    console.log(`(${dx}, ${dz}): y30=${b30 ? b30.name : 'null'}, y31=${b31 ? b31.name : 'null'}`);
  }
}
