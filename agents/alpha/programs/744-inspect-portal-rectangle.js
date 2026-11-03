// programs/744-inspect-portal-rectangle.js
console.log('=== Program 744: Inspect Nether Portal Rectangle ===');

for (let y = 76; y >= 72; y--) {
  let row = `y=${y}: `;
  for (let x = 298; x <= 301; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    row += `[${x}: ${b ? b.name : 'null'}] `;
  }
  console.log(row);
}

// Check where flint or gravel or iron are nearby
const gravels = bot.findBlocks({ matching: b => b && b.name === 'gravel', maxDistance: 32, count: 5 });
console.log(`Gravel blocks within 32m (${gravels.length}):`, gravels.map(p => lib.fmt(p)));

const irons = bot.findBlocks({ matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'), maxDistance: 32, count: 5 });
console.log(`Iron ores within 32m (${irons.length}):`, irons.map(p => lib.fmt(p)));

return {};
