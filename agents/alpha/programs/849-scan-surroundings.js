// programs/849-scan-surroundings.js
console.log('=== Program 849: Scan Surroundings ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const px = Math.floor(bot.entity.position.x);
const py = Math.floor(bot.entity.position.y);
const pz = Math.floor(bot.entity.position.z);

console.log(`Scanning vertical column at x=${px}, z=${pz} from y=${py} to y=36:`);
for (let y = py; y <= 36; y++) {
  const b = bot.blockAt(new Vec3(px, y, pz));
  console.log(`y=${y}: ${b?.name} (solid=${b?.boundingBox === 'block'})`);
}

// Find closest air blocks above y=30
const airBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'air' || b.name === 'cave_air'),
  maxDistance: 20,
  count: 10
});

console.log(`Found ${airBlocks.length} air blocks within 20m:`);
for (const p of airBlocks) {
  console.log(`  air at ${lib.fmt(p)}`);
}

// Find any solid blocks at or above y=31
const solidBlocks = bot.findBlocks({
  matching: b => b && b.boundingBox === 'block' && b.position.y >= 30,
  maxDistance: 20,
  count: 10
});
console.log(`Found ${solidBlocks.length} solid blocks >= y=30 within 20m:`);
for (const p of solidBlocks) {
  const b = bot.blockAt(p);
  console.log(`  solid ${b?.name} at ${lib.fmt(p)}`);
}
