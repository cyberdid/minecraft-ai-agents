// programs/532-bridge-to-spawner-balcony.js
console.log('=== Program 532: Bridge to Spawner Balcony ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Cobble:', lib.count('cobblestone'), 'Dirt:', lib.count('dirt'));

bot.pathfinder.stop();
await sleep(100);

async function placeBlock(name, x, y, z) {
  const b = bot.blockAt(new Vec3(x, y, z));
  if (b && b.name !== 'air' && b.name !== 'cave_air') return true;
  try {
    await lib.place(name, x, y, z);
    console.log(`Placed ${name} at (${x}, ${y}, ${z})`);
    return true;
  } catch (e) {
    console.log(`Place (${x}, ${y}, ${z}) note: ${e.message}`);
    return false;
  }
}

// 1. Advance bot to edge at (43.5, 65.0, -175.5)
console.log('Stepping to bridge edge at (43.5, 65.0, -175.5)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(43.5, 65.0, -175.5, 1));
} catch (e) {
  await bot.lookAt(new Vec3(43.5, 65.0, -175.5), true);
  bot.setControlState('forward', true);
  await sleep(400);
  bot.setControlState('forward', false);
}
console.log('At edge:', lib.fmt(bot.entity.position));

// 2. Define bridge waypoints connecting to the nether brick platform at (34, 67, -188)
const bridgeFloor = [
  { x: 43, y: 64, z: -176 },
  { x: 42, y: 64, z: -177 },
  { x: 41, y: 65, z: -178 },
  { x: 40, y: 65, z: -179 },
  { x: 39, y: 65, z: -181 },
  { x: 38, y: 66, z: -182 },
  { x: 37, y: 66, z: -184 },
  { x: 36, y: 66, z: -185 },
  { x: 35, y: 67, z: -186 },
  { x: 35, y: 67, z: -187 },
  { x: 34, y: 67, z: -188 } // Connects to Spawner Balcony!
];

console.log('Placing bridge floor blocks towards Spawner Balcony...');
for (let i = 0; i < bridgeFloor.length; i++) {
  const p = bridgeFloor[i];
  const mat = lib.count('cobblestone') > 5 ? 'cobblestone' : (lib.count('dirt') > 0 ? 'dirt' : 'birch_planks');
  if (!mat) break;
  
  // Place floor block
  const placed = await placeBlock(mat, p.x, p.y, p.z);
  
  // Step onto newly placed floor if bot is within 3 blocks
  const dist = bot.entity.position.distanceTo(new Vec3(p.x, p.y + 1, p.z));
  if (placed && dist > 1.5 && dist < 4) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(p.x, p.y + 1, p.z, 1));
    } catch (e) {}
  }
}

console.log('Alpha pos after bridging:', lib.fmt(bot.entity.position));
const spawnerPos = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawnerPos);
console.log(`Distance to Blaze Spawner: ${dist.toFixed(1)}m`);
bot.chat(`alpha: Bridging forward to Spawner Balcony! Distance: ${dist.toFixed(1)}m! Cobble: ${lib.count('cobblestone')}`);

// Check hostiles nearby
const hostiles = lib.hostiles(24);
console.log(`Hostiles nearby (${hostiles.length}):`);
for (const h of hostiles) {
  console.log(`  ${h.name} at ${lib.fmt(h.pos)} (dist ${h.dist.toFixed(1)}m)`);
}
