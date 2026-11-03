// programs/734-descend-to-end-portal-room.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 734: DESCEND TO END PORTAL ROOM (2210, 0, 1470) ===');
console.log('Delta start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

const portalCenter = new Vec3(2210.0, 1.0, 1470.0);

// Equip iron pickaxe in hand for digging corridors
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) {
  try { await bot.equip(pick, 'hand'); } catch (e) {}
}

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
moves.canOpenDoors = true;
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

bot.chat('delta: Navigating corridors down to End Portal Room (2210, 0, 1470)...');

const start = Date.now();
const MAX_TIME = 45000;

try {
  await bot.pathfinder.goto(new goals.GoalNear(portalCenter.x, portalCenter.y, portalCenter.z, 2.0));
} catch (err) {
  console.log('Pathfinder goto note:', err.message);
}

// Check current position
console.log('Delta pos now:', lib.fmt(bot.entity.position));
const dist = bot.entity.position.distanceTo(portalCenter);
console.log(`Distance to End Portal center: ${dist.toFixed(1)}m`);

// Scan for End Portal frames
const frames = bot.findBlocks({
  matching: b => b && b.name === 'end_portal_frame',
  maxDistance: 16,
  count: 12
});

console.log(`\nFound ${frames.length}/12 End Portal Frame blocks nearby:`);
let emptyCount = 0;
let filledCount = 0;

for (const fp of frames) {
  const b = bot.blockAt(fp);
  const hasEye = b?._properties?.eye === true || b?._properties?.eye === 'true';
  if (hasEye) filledCount++;
  else emptyCount++;
  console.log(`  Frame at ${lib.fmt(fp)}: eye=${hasEye}`);
}

console.log(`Summary: ${filledCount} filled, ${emptyCount} empty`);

// Check if end_portal blocks exist
const portals = bot.findBlocks({
  matching: b => b && b.name === 'end_portal',
  maxDistance: 8,
  count: 9
});
console.log(`Active End Portal blocks: ${portals.length}`);

if (portals.length > 0) {
  bot.chat(`delta: Milestone 11 COMPLETE! Active End Portal ignited at (2210, 0, 1470)!`);
}

return {
  pos: bot.entity.position,
  distToPortal: dist,
  framesFound: frames.length,
  emptyFrames: emptyCount,
  filledFrames: filledCount,
  portalsActive: portals.length,
  hp: bot.health,
  food: bot.food
};
