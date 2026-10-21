const cur = bot.entity.position;
console.log(`Current position: (${cur.x.toFixed(2)}, ${cur.y.toFixed(2)}, ${cur.z.toFixed(2)})`);

for (let dx = -4; dx <= 4; dx++) {
  for (let dz = -4; dz <= 4; dz++) {
    const b = lib.blockAt(Math.floor(cur.x) + dx, Math.floor(cur.y), Math.floor(cur.z) + dz);
    if (b && b.name.includes('door')) {
      console.log(`Found door at (${b.position.x}, ${b.position.y}, ${b.position.z}): ${b.name}`);
    }
  }
}

// Check blocks along path to (12, 67, -21)
console.log('Block at (12, 66, -21):', lib.blockAt(12, 66, -21)?.name);
console.log('Block at (12, 67, -21):', lib.blockAt(12, 67, -21)?.name);
console.log('Block at (12, 68, -21):', lib.blockAt(12, 68, -21)?.name);
console.log('Block at (12, 67, -20):', lib.blockAt(12, 67, -20)?.name);
