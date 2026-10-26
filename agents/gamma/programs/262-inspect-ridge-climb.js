// programs/262-inspect-ridge-climb.js
console.log('=== INSPECT RIDGE CLIMB & TERRAIN ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Scan blocks in 3D grid between x=46..58, z=-10..0, y=63..70
console.log('\n--- TERRAIN SLICE along z = -3 to -1 ---');
for (let x = 46; x <= 56; x += 2) {
  let col = [];
  for (let y = 64; y <= 69; y++) {
    const b = bot.blockAt(new Vec3(x, y, -2));
    if (b && b.name !== 'air') col.push(`y${y}:${b.name}`);
  }
  console.log(`x=${x}, z=-2: [${col.join(', ')}]`);
}

// 2. Dropped items at (56, 68, -2)
const drops = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 20);
console.log(`\nDropped items (${drops.length}):`);
for (const it of drops) {
  console.log(` - Item ${it.id} at ${lib.fmt(it.position)} dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// 3. Test pathfinding with GoalNear to (56, 68, -2)
const target = new Vec3(56, 68, -2);
const path = bot.pathfinder.getPathTo(bot.pathfinder.movements, new goals.GoalNear(target.x, target.y, target.z, 1));
console.log(`\nPathfinder to ${lib.fmt(target)}: status=${path.status} cost=${path.cost?.toFixed(1)} len=${path.path?.length}`);
if (path.path && path.path.length > 0) {
  console.log('Path nodes:');
  for (let i = 0; i < Math.min(6, path.path.length); i++) {
    const node = path.path[i];
    console.log(` step ${i + 1}: (${node.x}, ${node.y}, ${node.z})`);
  }
}
