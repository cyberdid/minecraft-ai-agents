// programs/444-step-exact-portal-block.js
console.log('=== Step: Step directly into Nether portal block at (40.5, 65.0, -7.0) ===');
console.log('Current pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Find nether_portal block
const pb = bot.findBlocks({
  matching: mcData.blocksByName.nether_portal.id,
  maxDistance: 4,
  count: 1
})[0];

if (pb) {
  console.log('Found nether_portal block at', lib.fmt(pb));
  // Walk directly into the portal block
  await bot.lookAt(new Vec3(pb.x + 0.5, pb.y, pb.z + 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.clearControlStates();
  console.log('Inside portal block at', lib.fmt(bot.entity.position));

  // Wait for dimension change
  for (let i = 0; i < 10; i++) {
    await sleep(1000);
    if (isCancelled()) break;
    if (bot.game.dimension === 'overworld' || bot.game.dimension === 'minecraft:overworld') {
      console.log('Successfully teleported to Overworld! Pos:', lib.fmt(bot.entity.position));
      break;
    }
  }
} else {
  console.log('No nether_portal block within 4m!');
}

console.log(`Dimension now: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);
