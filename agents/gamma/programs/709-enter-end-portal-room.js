// programs/709-enter-end-portal-room.js
console.log('=== END PORTAL ROOM ENTRY ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Find portal frames
const frames = bot.findBlocks({
  matching: b => b && (b.name === 'end_portal_frame' || b.name === 'end_portal'),
  maxDistance: 24,
  count: 16
});

console.log(`Found ${frames.length} end portal frames nearby:`);
for (const p of frames) {
  const b = bot.blockAt(p);
  console.log(`Frame at ${lib.fmt(p)}: name=${b?.name}, eye=${b?._properties?.eye}`);
}

// Find path up to (2210, 1, 1470)
const portalTarget = new Vec3(2210, 1, 1470);
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

console.log('Pathfinding to portal center (2210, 1, 1470)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(portalTarget.x, portalTarget.y, portalTarget.z, 1.5));
} catch (e) {
  console.log('Pathfinder error:', e.message);
}

console.log('Pos after pathfinder:', lib.fmt(bot.entity.position));
return { pos: bot.entity.position, frames: frames.length };
