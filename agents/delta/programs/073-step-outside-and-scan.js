// programs/073-step-outside-and-scan.js
console.log('Pos before:', lib.fmt(bot.entity.position));

// 1. Check door
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
console.log('Door at (294, 72, -54):', door ? door.name : 'none');

// 2. Open door and step outside to (294, 72, -52)
if (door && door.name.includes('door')) {
  await bot.activateBlock(door);
  await sleep(300);
  await lib.walkTo(294, -52);
  await sleep(300);
  // close door behind us
  await bot.activateBlock(bot.blockAt(doorPos));
} else {
  await lib.goTo(294, 72, -52);
}

console.log('Pos outside:', lib.fmt(bot.entity.position));

// 3. Scan for surface animals in a 128-block radius
const animals = [];
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (!e || !e.position) continue;
  if (['cow', 'sheep', 'pig', 'chicken', 'rabbit'].includes(e.name)) {
    const d = bot.entity.position.distanceTo(e.position);
    animals.push({ name: e.name, pos: lib.fmt(e.position), dist: Math.round(d), rawPos: e.position });
  }
}
animals.sort((a,b) => a.dist - b.dist);
console.log(`Found ${animals.length} animals:`);
for (const a of animals.slice(0, 10)) {
  console.log(`- ${a.name} at ${a.pos} (dist ${a.dist})`);
}

// 4. Scan surface water
const waterBlocks = bot.findBlocks({
  matching: b => b.name === 'water',
  maxDistance: 64,
  count: 50
});
const surfaceWater = [];
for (const p of waterBlocks) {
  const above = bot.blockAt(p.offset(0, 1, 0));
  if (above && (above.name === 'air' || above.name === 'cave_air')) {
    surfaceWater.push(p);
  }
}
console.log(`Found ${surfaceWater.length} surface water blocks. Nearest:`, surfaceWater[0] ? lib.fmt(surfaceWater[0]) : 'none');
