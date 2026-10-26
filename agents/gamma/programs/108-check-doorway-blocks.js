// programs/108-check-doorway-blocks.js
console.log('--- INSPECTING DOORWAY BLOCKS ---');
for (let z = -56; z <= -51; z++) {
  for (let x = 292; x <= 295; x++) {
    for (let y = 71; y <= 73; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air') {
        console.log(`(${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}
console.log('Players nearby:');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`- ${name} at ${lib.fmt(p.entity.position)}`);
}
