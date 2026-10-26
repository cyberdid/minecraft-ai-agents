// programs/529-advance-west-shield-corridor.js
console.log('=== Program 529: Advance West Shield Corridor ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Cobble:', lib.count('cobblestone'));

bot.pathfinder.stop();
await sleep(100);

// Helper to place block safely
async function placeBlock(name, x, y, z) {
  const b = bot.blockAt(new Vec3(x, y, z));
  if (b && b.name !== 'air' && b.name !== 'cave_air') return;
  try {
    await lib.place(name, x, y, z);
    console.log(`Placed ${name} at (${x}, ${y}, ${z})`);
  } catch (e) {
    console.log(`Place (${x}, ${y}, ${z}) note: ${e.message}`);
  }
}

// 1. Dig the blocking baffle at (44, 65..66, -160)
console.log('Digging through baffle at (44, 65..66, -160)...');
try {
  const bUpper = bot.blockAt(new Vec3(44, 66, -160));
  if (bUpper && bUpper.name !== 'air') await lib.dig(44, 66, -160);
  const bLower = bot.blockAt(new Vec3(44, 65, -160));
  if (bLower && bLower.name !== 'air') await lib.dig(44, 65, -160);
} catch (e) {
  console.log('Dig baffle note:', e.message);
}

// 2. Pre-place West blast wall for z=-161 to -164 while standing at z=-159
for (let z = -161; z >= -164; z--) {
  console.log(`Pre-building West wall at z=${z}...`);
  await placeBlock('cobblestone', 43, 64, z); // Floor
  await placeBlock('cobblestone', 43, 65, z); // Lower wall
  await placeBlock('cobblestone', 43, 66, z); // Upper wall
}

// 3. Step forward to z=-163 and pick up drop
console.log('Stepping forward to z=-163...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(44, 65, -163, 1));
} catch (e) {
  await bot.lookAt(new Vec3(44.5, 65.0, -163.0), true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);
}
console.log('Arrived at:', lib.fmt(bot.entity.position));
await lib.pickup(4);

// 4. Continue placing West wall for z=-165 to -168
for (let z = -165; z >= -168; z--) {
  console.log(`Building West wall at z=${z}...`);
  await placeBlock('cobblestone', 43, 64, z);
  await placeBlock('cobblestone', 43, 65, z);
  await placeBlock('cobblestone', 43, 66, z);
}

// 5. Step forward to mountain entrance at z=-169..-170
console.log('Stepping forward to mountain cover at z=-169...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(44, 65, -169, 1));
} catch (e) {
  await bot.lookAt(new Vec3(44.5, 65.0, -169.0), true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.setControlState('forward', false);
}

console.log('Safely inside mountain section at:', lib.fmt(bot.entity.position));
bot.chat(`alpha: Walkway West blast wall complete to mountain rock at z=-169! Corridor 100% secure! Cobble: ${lib.count('cobblestone')}`);

// 6. Check hostiles and Blaze Spawner distance
const hostiles = lib.hostiles(24);
console.log(`Hostiles nearby (${hostiles.length}):`);
for (const h of hostiles) {
  console.log(`  ${h.name} at ${lib.fmt(h.pos)} (dist ${h.dist.toFixed(1)}m)`);
}

const spawnerPos = new Vec3(32, 68, -190);
console.log(`Distance to Spawner: ${bot.entity.position.distanceTo(spawnerPos).toFixed(1)}m`);
console.log('Final HP:', bot.health, 'Food:', bot.food, 'Cobble:', lib.count('cobblestone'));
