// programs/327-check-east.js
console.log('=== Inspect East (x > 297) and North (z < 2) around (297, 39, 2) ===');
const p = bot.entity.position.floored();

bot.chat('beta: Holding 10 obsidian, diamond pick, flint & steel! At (297, 39, 2). Finding quickest way up!');

// Check east blocks from x=297 to x=306 at y=39..41
console.log('East check (x=297..306, z=2):');
for (let x = 297; x <= 306; x++) {
  const b39 = bot.blockAt(new Vec3(x, 39, 2))?.name;
  const b40 = bot.blockAt(new Vec3(x, 40, 2))?.name;
  const b41 = bot.blockAt(new Vec3(x, 41, 2))?.name;
  console.log(`x=${x}: y=39:${b39}, y=40:${b40}, y=41:${b41}`);
}

// Check south cave path (z=2..12) - is there another fork in the cave?
console.log('South cave check (z=2..12):');
for (let z = 2; z <= 12; z++) {
  const airBlocks = [];
  for (let x = 285; x <= 305; x++) {
    for (let y = 18; y <= 40; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && (b.name === 'air' || b.name === 'cave_air')) {
        airBlocks.push(`(${x},${y})`);
      }
    }
  }
  console.log(`z=${z}: ${airBlocks.length} air blocks`);
}
