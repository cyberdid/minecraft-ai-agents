// programs/169-find-dry-land.js
console.log('--- FIND DRY LAND AND REACH SHORE ---');
console.log('Pos:', bot.entity.position);

// Find blocks with y >= 62 that are solid
const dryLand = bot.findBlocks({
  matching: b => b.boundingBox === 'block' && b.position.y >= 62 && !['water', 'seagrass', 'tall_seagrass'].includes(b.name),
  maxDistance: 32,
  count: 20
});

console.log(`Found ${dryLand.length} dry land blocks:`);
dryLand.sort((a, b) => bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b));

for (const p of dryLand.slice(0, 5)) {
  console.log(`Dry land at ${lib.fmt(p)}: ${bot.blockAt(p)?.name}, dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m`);
}

if (dryLand.length > 0) {
  const target = dryLand[0];
  console.log(`Swimming towards dry land at ${lib.fmt(target)}...`);
  // Look at target, swim forward and jump
  bot.setControlState('jump', true);
  await lib.walkTo(target.x + 0.5, target.z + 0.5, 8000);
  bot.setControlState('jump', false);
  console.log('New pos:', lib.fmt(bot.entity.position));
  
  // Check if now on solid ground
  const under = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  console.log('Block under feet:', under?.name);
  if (under && under.boundingBox === 'block' && under.name !== 'water') {
    console.log('ON DRY LAND! Now executing emergency shelter...');
    try {
      await lib.shelter();
      console.log('SHELTER SUCCESS! Pos:', lib.fmt(bot.entity.position));
      bot.chat(`Gamma safely sheltered underground at ${lib.fmt(bot.entity.position)}.`);
    } catch (e) {
      console.log('Shelter err:', e.message);
    }
  }
} else {
  console.log('No dry land within 32 blocks, checking 64 blocks:');
  const dryLandFar = bot.findBlocks({
    matching: b => b.boundingBox === 'block' && b.position.y >= 62 && !['water', 'seagrass', 'tall_seagrass'].includes(b.name),
    maxDistance: 64,
    count: 5
  });
  for (const p of dryLandFar) {
    console.log(`Far land at ${lib.fmt(p)}: ${bot.blockAt(p)?.name}, dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m`);
  }
  if (dryLandFar.length > 0) {
    bot.setControlState('jump', true);
    await lib.walkTo(dryLandFar[0].x + 0.5, dryLandFar[0].z + 0.5, 10000);
    bot.setControlState('jump', false);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));
