// programs/559-check-portal-blocks.js
console.log('=== CHECK PORTAL FRAME BLOCKS ===');
console.log(`Delta pos: ${lib.fmt(bot.entity.position)}`);

for (let y = 72; y <= 75; y++) {
  for (let x = 298; x <= 301; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    console.log(`Block at (${x}, ${y}, -54): ${b ? b.name : 'null'}`);
  }
}

// Check where the nether_portal block is
const p = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 6 });
if (p) {
  console.log(`nether_portal block found at: ${lib.fmt(p.position)}`);
} else {
  console.log('NO nether_portal block found within 6m!');
}
