// programs/261-find-path-to-surface.js
console.log('=== Program 261: Check Path to Base / Surface ===');
const basePos = new Vec3(294, 72, -55);
const shaftTop = new Vec3(302, 71, -44);

console.log('Alpha at:', lib.fmt(bot.entity.position));

// Let's check blocks in immediate surroundings
const p = bot.entity.position.floored();
for (let dy = 2; dy >= -1; dy--) {
  let row = `dy=${dy}: `;
  for (let dz = -2; dz <= 2; dz++) {
    for (let dx = -2; dx <= 2; dx++) {
      const b = bot.blockAt(p.offset(dx, dy, dz));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        row += `(${dx},${dz}:${b.name}) `;
      }
    }
  }
  console.log(row);
}

// Check pathfinder goal
const movements = new Movements(bot, mcData);
movements.canDig = false; // test if clear walk path exists first
bot.pathfinder.setMovements(movements);

console.log('Testing path to shaft top (302, 71, -44)...');
const path1 = bot.pathfinder.getPathTo(movements, new goals.GoalNear(shaftTop.x, shaftTop.y, shaftTop.z, 2), 5000);
console.log('Path to shaft top status:', path1.status, 'nodes:', path1.path?.length);

console.log('Testing path to base (294, 72, -55)...');
const path2 = bot.pathfinder.getPathTo(movements, new goals.GoalNear(basePos.x, basePos.y, basePos.z, 2), 5000);
console.log('Path to base status:', path2.status, 'nodes:', path2.path?.length);

// If no clear walk path, test with canDig = true
if (path1.status !== 'success' && path2.status !== 'success') {
  movements.canDig = true;
  const pathDig = bot.pathfinder.getPathTo(movements, new goals.GoalNear(basePos.x, basePos.y, basePos.z, 2), 5000);
  console.log('Path with canDig to base status:', pathDig.status, 'nodes:', pathDig.path?.length);
}
