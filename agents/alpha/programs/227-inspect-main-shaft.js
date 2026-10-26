// programs/227-inspect-main-shaft.js
console.log('=== Program 227: Inspect Main Shaft & Path to Lava Lake ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position));

// Check shaft from y=71 down to y=18 at (302, y, -44)
console.log('Inspecting column at (302, y, -44):');
for (let y = 71; y >= 18; y -= 5) {
  const b = bot.blockAt(new Vec3(302, y, -44));
  console.log(`  y=${y}: ${b?.name} (boundingBox=${b?.boundingBox})`);
}

// Ask Beta to lead or coordinate
bot.chat('beta: Ready to head to (286, 18, 8) lava lake! Shall we go down the shaft at (302, 71, -44)?');

// Check Beta position and held item
if (bot.players.beta?.entity) {
  const b = bot.players.beta.entity;
  console.log('Beta pos:', lib.fmt(b.position), 'held:', b.heldItem?.name);
}

// Check base chest
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Base chest contents:', JSON.stringify(contents));
} catch (e) {}
