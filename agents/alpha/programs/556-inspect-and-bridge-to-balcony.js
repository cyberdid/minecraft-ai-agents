// programs/556-inspect-and-bridge-to-balcony.js
console.log('=== Program 556: Scout & Advance towards Spawner Balcony ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Blocks in inv:', {
  cobblestone: lib.count('cobblestone'),
  dirt: lib.count('dirt'),
  birch_planks: lib.count('birch_planks'),
  soul_sand: lib.count('soul_sand')
});

await lib.equipWeapon();

// 1. Walk carefully to (37, 65, -178) along confirmed solid floor
const safeFloorWalk = [
  new Vec3(44, 65, -176),
  new Vec3(43, 65, -176),
  new Vec3(41, 65, -176),
  new Vec3(39, 65, -176),
  new Vec3(38, 65, -177),
  new Vec3(37, 65, -178)
];

for (const target of safeFloorWalk) {
  // Verify floor under target
  const floorBlock = bot.blockAt(new Vec3(target.x, target.y - 1, target.z));
  if (!floorBlock || floorBlock.boundingBox !== 'block') {
    console.log(`ABORT step to ${lib.fmt(target)}: floor is ${floorBlock?.name}`);
    break;
  }
  
  // Safe step: look at target feet, walk smoothly
  await bot.lookAt(new Vec3(target.x + 0.5, target.y, target.z + 0.5), true);
  bot.setControlState('forward', true);
  const startTime = Date.now();
  while (bot.entity.position.distanceTo(new Vec3(target.x + 0.5, target.y, target.z + 0.5)) > 0.6) {
    if (Date.now() - startTime > 3000) break;
    await sleep(50);
  }
  bot.setControlState('forward', false);
  console.log(`Stepped to ${lib.fmt(bot.entity.position)}`);
}

console.log('Current frontline position:', lib.fmt(bot.entity.position));

// 2. Scan surroundings towards Spawner Balcony (x: 28..38, z: -178..-194, y: 63..72)
console.log('--- Scanning towards Spawner Balcony ---');
const spawners = bot.findBlocks({
  matching: b => b && b.name === 'spawner',
  maxDistance: 32,
  count: 5
});
console.log(`Found ${spawners.length} spawners:`, spawners.map(p => lib.fmt(p)));

const netherBricks = bot.findBlocks({
  matching: b => b && (b.name === 'nether_bricks' || b.name === 'nether_brick_fence' || b.name === 'nether_brick_stairs'),
  maxDistance: 32,
  count: 10
});
console.log(`Found ${netherBricks.length} nether brick blocks nearby:`, netherBricks.slice(0, 5).map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// Check nearby item drops (Beta's drops)
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 16);
console.log(`Found ${items.length} item entities within 16m:`, items.map(it => `item at ${lib.fmt(it.position)}`));
if (items.length > 0) {
  try { await lib.pickup(8); } catch (e) {}
}

// Check nearby hostiles
const hostiles = lib.hostiles(32);
console.log(`Hostiles within 32m (${hostiles.length}):`, hostiles.map(h => `${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`));

// 3. Inspect the gap ahead from current position towards (32, 68, -190)
const cur = bot.entity.position.floored();
console.log(`Alpha floor at: ${lib.fmt(cur)}`);
for (let dz = -1; dz >= -6; dz--) {
  for (let dx = 0; dx >= -4; dx--) {
    const p = cur.offset(dx, 0, dz);
    const fl = bot.blockAt(p.offset(0, -1, 0))?.name || 'air';
    const b = bot.blockAt(p)?.name || 'air';
    if (fl !== 'air' || b !== 'air') {
      console.log(`Ahead offset (${dx}, ${dz}) at ${lib.fmt(p)}: floor=${fl}, at_feet=${b}`);
    }
  }
}

bot.chat(`alpha: Frontline recon complete at ${lib.fmt(bot.entity.position)}! Spawners: ${spawners.length}, Hostiles: ${hostiles.length}`);
