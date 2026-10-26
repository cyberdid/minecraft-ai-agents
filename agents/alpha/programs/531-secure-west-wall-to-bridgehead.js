// programs/531-secure-west-wall-to-bridgehead.js
console.log('=== Program 531: Secure West Wall to Bridgehead ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Cobble:', lib.count('cobblestone'));

bot.pathfinder.stop();
await sleep(100);

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

// 1. Build West wall for z=-171 to -175
for (let z = -171; z >= -175; z--) {
  console.log(`Building West wall at z=${z}...`);
  await placeBlock('cobblestone', 43, 64, z); // floor
  await placeBlock('cobblestone', 43, 65, z); // lower wall
  await placeBlock('cobblestone', 43, 66, z); // upper wall
}

// 2. Advance to z=-174
console.log('Advancing to bridgehead at (44, 65, -174)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(44, 65, -174, 1));
} catch (e) {
  console.log('Advance note:', e.message);
  await bot.lookAt(new Vec3(44.5, 65.0, -174.0), true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.setControlState('forward', false);
}

console.log('Arrived at bridgehead:', lib.fmt(bot.entity.position));
bot.chat(`alpha: Bridgehead reached at ${lib.fmt(bot.entity.position)}! West wall secured to z=-175! Cobble: ${lib.count('cobblestone')}`);

// 3. Scan hostiles and distance to Spawner
const hostiles = lib.hostiles(24);
console.log(`Hostiles nearby (${hostiles.length}):`);
for (const h of hostiles) {
  console.log(`  ${h.name} at ${lib.fmt(h.pos)} (dist ${h.dist.toFixed(1)}m)`);
}

const spawnerPos = new Vec3(32, 68, -190);
console.log(`Distance to Spawner: ${bot.entity.position.distanceTo(spawnerPos).toFixed(1)}m`);
console.log('Alpha HP:', bot.health, 'Food:', bot.food, 'Cobble:', lib.count('cobblestone'));
