// Scan from x: 8 to 16, y: 65 to 72, z: -27 to -19
let solidCount = 0;
const blocksFound = {};

for (let y = 65; y <= 72; y++) {
  for (let x = 8; x <= 16; x++) {
    for (let z = -27; z <= -19; z++) {
      const b = lib.blockAt(x, y, z);
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        solidCount++;
        blocksFound[b.name] = (blocksFound[b.name] || 0) + 1;
      }
    }
  }
}

console.log(`Solid blocks found in house bounding box: ${solidCount}`);
console.log('Block counts:', JSON.stringify(blocksFound));

// Where is the crafting table?
const ct = lib.find('crafting_table', { maxDistance: 32 });
console.log('Crafting table exact pos:', ct.map(c => lib.fmt(c.position)));
