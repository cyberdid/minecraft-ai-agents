// 1. Craft sandstone from our 30 sand
const sandCount = lib.count('sand');
if (sandCount >= 4) {
  const crafts = Math.floor(sandCount / 4);
  console.log(`Crafting ${crafts} sandstone...`);
  try {
    await lib.craft('sandstone', crafts);
  } catch (e) {
    console.log('Craft note:', e.message);
  }
}
console.log('Sandstone in inventory:', lib.count('sandstone'));

// 2. Build the remaining 9 roof blocks
const missingBlocks = [
  { x: 11, y: 70, z: -22, name: 'sandstone' },
  { x: 12, y: 70, z: -25, name: 'sandstone' },
  { x: 13, y: 70, z: -26, name: 'sandstone' },
  { x: 13, y: 70, z: -25, name: 'sandstone' },
  { x: 14, y: 70, z: -20, name: 'sandstone' },
  { x: 15, y: 70, z: -26, name: 'sandstone' },
  { x: 15, y: 70, z: -25, name: 'sandstone' },
  { x: 15, y: 70, z: -24, name: 'sandstone' },
  { x: 15, y: 70, z: -20, name: 'sandstone' }
];

console.log('Placing the final missing blocks...');
const r = await lib.build(missingBlocks, { replace: false });
console.log('Build result:', JSON.stringify(r));

// 3. Complete scan and verification of the full house
const bp = lib.shapes.house({
  x: 10,
  y: 67,
  z: -25,
  width: 5,
  depth: 5,
  height: 3,
  wall: 'sandstone',
  roof: 'sandstone',
  door: 'south',
  windows: true
});

let placed = 0;
const stillMissing = [];
for (const b of bp) {
  const cur = bot.blockAt(new Vec3(b.x, b.y, b.z));
  const isSolid = cur && (cur.name === b.name || (b.y === 70 && (cur.name === 'oak_planks' || cur.name === 'sandstone')));
  if (isSolid) {
    placed++;
  } else {
    stillMissing.push({ x: b.x, y: b.y, z: b.z, name: cur ? cur.name : 'air' });
  }
}

console.log(`========================================`);
console.log(`FINAL VERIFIED TOTAL: ${placed} / ${bp.length} blocks!`);
console.log(`Still missing count: ${stillMissing.length}`);
if (stillMissing.length > 0) {
  console.log(`Still missing details: ${JSON.stringify(stillMissing)}`);
}
console.log(`========================================`);

if (placed >= bp.length) {
  bot.chat(`alpha: THE HOUSE AT (10, 67, -25) IS OFFICIALLY 100% COMPLETE! All ${placed}/${bp.length} blocks verified: sandstone walls, solid roof, windows, and oak door! We did it!`);
} else {
  bot.chat(`alpha: House is at ${placed}/${bp.length} blocks! Only ${stillMissing.length} blocks left.`);
}

return { placed, total: bp.length, complete: placed >= bp.length };
