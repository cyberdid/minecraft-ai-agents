// programs/394-inspect-portal-blocks.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

const box = [];
for (let x = 296; x <= 300; x++) {
  for (let y = 71; y <= 76; y++) {
    for (let z = -56; z <= -52; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air') {
        box.push(`${b.name} at (${x}, ${y}, ${z})`);
      }
    }
  }
}

console.log(`Blocks around portal frame (${box.length}):`);
for (const line of box) console.log('  ' + line);
