// programs/372-enter-nether-and-join-beta.js
console.log('=== Program 372: Cross Nether Portal & Join Beta ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Move into the center of the nether_portal block
if (bot.game.dimension !== 'the_nether') {
  console.log('Stepping into portal center at (299.5, 73, -54.0)...');
  await bot.lookAt(new Vec3(299.5, 73, -54.0));
  bot.setControlState('forward', true);
  await sleep(800);
  bot.setControlState('forward', false);

  console.log('Waiting for Nether teleportation...');
  for (let t = 0; t < 25; t++) {
    if (bot.game.dimension === 'the_nether') break;
    await sleep(500);
  }
}

console.log('Dimension now:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha arrived in the Nether at ${lib.fmt(bot.entity.position)}! Assisting Beta with cobblestone bunker.`);

  // Find Beta
  const beta = bot.players['beta'];
  if (beta && beta.entity) {
    console.log(`Beta located at ${lib.fmt(beta.entity.position)} (dist: ${bot.entity.position.distanceTo(beta.entity.position).toFixed(1)}m)`);
  }

  // Scan portal blocks in the Nether
  const portalBlocks = bot.findBlocks({
    matching: (b) => b && b.name === 'nether_portal',
    maxDistance: 16,
    count: 10
  });
  console.log(`Found ${portalBlocks.length} nether_portal blocks in the Nether!`);
  for (const pb of portalBlocks) {
    console.log(`  Portal block at: ${lib.fmt(pb)}`);
  }

  // Help fortify portal with cobblestone
  console.log('Alpha carrying cobblestone:', lib.count('cobblestone'));
  // Build a safety perimeter if any exposed lava or drops near portal
  const hostiles = lib.hostiles(24);
  console.log('Hostiles within 24 blocks in Nether:', JSON.stringify(hostiles));

  // Check nearby terrain
  const netherPos = bot.entity.position;
  console.log('Nether foothold established at:', lib.fmt(netherPos));
} else {
  console.log('Still in Overworld, retrying portal step...');
}

console.log('Final status:', JSON.stringify(lib.status()));
