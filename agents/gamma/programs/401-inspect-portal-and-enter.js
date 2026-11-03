// programs/401-inspect-portal-and-enter.js
console.log('=== INSPECT PORTAL & ENTER ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Scan for nether_portal blocks within 5 blocks
const portalBlocks = bot.findBlocks({
  matching: mcData.blocksByName.nether_portal?.id || (b => b?.name === 'nether_portal'),
  maxDistance: 6,
  count: 10
});

console.log(`Found ${portalBlocks.length} nether_portal blocks:`, portalBlocks.map(p => lib.fmt(p)));

if (portalBlocks.length === 0) {
  // Check what blocks are around (298..300, 72..75, -55..-53)
  for (let x = 297; x <= 300; x++) {
    for (let y = 72; y <= 75; y++) {
      for (let z = -55; z <= -53; z++) {
        const b = bot.blockAt(new Vec3(x, y, z));
        if (b && b.name !== 'air') {
          console.log(`Block at (${x}, ${y}, ${z}): ${b.name}`);
        }
      }
    }
  }
} else {
  // Target the first nether_portal block
  const target = portalBlocks[0];
  console.log(`Targeting nether_portal block at ${lib.fmt(target)}...`);
  
  // Jump/walk directly into the target block
  bot.lookAt(new Vec3(target.x + 0.5, target.y + 0.5, target.z + 0.5));
  
  // Jump up to reach y=73
  if (bot.entity.position.y < target.y) {
    bot.setControlState('jump', true);
  }
  
  // Pathfind or direct move into block center
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(target.x, target.y, target.z));
  } catch (e) {
    // If pathfinder refuses portal blocks, move with controls
    console.log('Pathfinder note:', e.message);
    const center = new Vec3(target.x + 0.5, target.y, target.z + 0.5);
    const dir = center.minus(bot.entity.position);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(800);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }
  
  console.log('Stepped towards portal block! Pos now:', lib.fmt(bot.entity.position));
  
  // Stand still inside portal for up to 12s
  console.log('Waiting for dimension transition...');
  const t0 = Date.now();
  while (Date.now() - t0 < 12000 && bot.game.dimension !== 'the_nether' && !isCancelled()) {
    await sleep(500);
  }
  
  console.log(`Dimension after wait: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);
}

return {
  portalBlocks: portalBlocks.length,
  dim: bot.game.dimension,
  pos: bot.entity.position
};
