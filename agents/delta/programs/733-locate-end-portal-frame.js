// programs/733-locate-end-portal-frame.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 733: SCAN FOR END PORTAL FRAME AT STRONGHOLD ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Check all players
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m, held=${p.heldItem?.name}`);
}

// 1. Scan for end_portal_frame
const frames = bot.findBlocks({
  matching: b => b && b.name === 'end_portal_frame',
  maxDistance: 48,
  count: 24
});

console.log(`Found ${frames.length} end_portal_frame blocks within 48m!`);
for (const fp of frames) {
  const b = bot.blockAt(fp);
  console.log(`  Frame at ${lib.fmt(fp)}: eye=${b?._properties?.eye}`);
}

// 2. Scan for end_portal blocks
const portals = bot.findBlocks({
  matching: b => b && b.name === 'end_portal',
  maxDistance: 48,
  count: 12
});
console.log(`Found ${portals.length} active end_portal blocks!`);

// 3. Scan for silverfish spawner
const spawners = bot.findBlocks({
  matching: b => b && b.name === 'spawner',
  maxDistance: 48,
  count: 5
});
console.log(`Found ${spawners.length} spawners!`);
for (const sp of spawners) {
  console.log(`  Spawner at ${lib.fmt(sp)}`);
}

// 4. Scan for stone bricks if no frame yet
if (frames.length === 0) {
  const bricks = bot.findBlocks({
    matching: b => b && (b.name.includes('stone_brick') || b.name.includes('iron_bars')),
    maxDistance: 32,
    count: 20
  });
  console.log(`Found ${bricks.length} stronghold brick blocks within 32m:`);
  for (const bp of bricks.slice(0, 5)) {
    console.log(`  ${bot.blockAt(bp)?.name} at ${lib.fmt(bp)}`);
  }
}

return {
  framesCount: frames.length,
  portalsCount: portals.length,
  pos: bot.entity.position,
  frames: frames.map(f => ({ x: f.x, y: f.y, z: f.z }))
};
