const bp = lib.shapes.house({
  x: 10, y: 67, z: -25,
  width: 5, depth: 5, height: 3,
  wall: 'sandstone',
  roof: 'sandstone',
  door: 'south',
  windows: true
});

const doorBlocks = bp.filter(b => b.name === 'air' || (b.y < 69 && b.z === -21));
console.log('Door/opening blocks in bp:', JSON.stringify(doorBlocks));

// Check real blocks around (12, 67, -21)
for (let y = 66; y <= 70; y++) {
  for (let x = 11; x <= 13; x++) {
    for (let z = -22; z <= -20; z++) {
      const b = lib.blockAt(x, y, z);
      if (b && b.name !== 'air') {
        console.log(`(${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}
