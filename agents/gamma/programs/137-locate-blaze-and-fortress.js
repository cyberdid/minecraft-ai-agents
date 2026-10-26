// programs/137-locate-blaze-and-fortress.js
console.log('--- LOCATE BLAZE SPAWNER & FORTRESS STRUCTURES ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Search for spawner blocks
const spawners = bot.findBlocks({
  matching: b => b.name.includes('spawner'),
  maxDistance: 64,
  count: 5
});
console.log(`Found ${spawners.length} spawners:`, spawners.map(s => lib.fmt(s)).join(', '));

// 2. Check entities / blazes
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze' && e.position);
console.log(`Found ${blazes.length} blazes:`, blazes.map(b => `${lib.fmt(b.position)} dist=${b.position.distanceTo(bot.entity.position).toFixed(1)}`).join(' | '));

// 3. Scan for nether_brick or netherrack blocks along various rays
console.log('Scanning along x=32..44, y=64..72, z=-140..-190:');
for (const x of [44, 40, 36, 32]) {
  for (let z = -140; z >= -190; z -= 10) {
    let solidY = [];
    for (let y = 60; y <= 72; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.boundingBox === 'block') solidY.push(`${y}:${b.name}`);
    }
    if (solidY.length > 0) {
      console.log(`(x=${x}, z=${z}): ${solidY.join(', ')}`);
    }
  }
}

// 4. Check where the mountain / ridge extends towards x=32
console.log('Checking horizontal connection from x=44 to x=32 at z=-140..-145:');
for (let z = -140; z >= -145; z--) {
  let line = `z=${z}: `;
  for (let x = 44; x >= 32; x -= 2) {
    const b64 = bot.blockAt(new Vec3(x, 64, z));
    const b65 = bot.blockAt(new Vec3(x, 65, z));
    line += `[x=${x}: 64=${b64 ? b64.name : 'air'}, 65=${b65 ? b65.name : 'air'}] `;
  }
  console.log(line);
}
