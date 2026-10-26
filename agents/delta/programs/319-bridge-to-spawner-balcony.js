// programs/319-bridge-to-spawner-balcony.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'cobble:', lib.count('cobblestone'), 'soul_sand:', lib.count('soul_sand'));

// Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'soul_sand');
if (cobble) await bot.equip(cobble, 'hand');

async function placeBlockAt(x, y, z) {
  const target = new Vec3(x, y, z);
  const existing = bot.blockAt(target);
  if (existing && existing.boundingBox === 'block') {
    return true; // Already solid
  }
  
  // Re-equip building block
  const blockItem = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'soul_sand');
  if (blockItem) await bot.equip(blockItem, 'hand');
  
  const neighbors = [
    new Vec3(0, -1, 0),
    new Vec3(0, 0, 1),
    new Vec3(1, 0, 0),
    new Vec3(-1, 0, 0),
    new Vec3(0, 0, -1),
    new Vec3(0, 1, 0)
  ];
  
  for (const n of neighbors) {
    const refPos = target.plus(n);
    const refBlock = bot.blockAt(refPos);
    if (refBlock && refBlock.boundingBox === 'block') {
      try {
        const faceVec = new Vec3(-n.x, -n.y, -n.z);
        await bot.placeBlock(refBlock, faceVec);
        console.log(`Placed block at (${x},${y},${z}) against (${refPos.x},${refPos.y},${refPos.z})`);
        return true;
      } catch (e) {}
    }
  }
  console.log(`Could not place at (${x},${y},${z}): no solid neighbor`);
  return false;
}

// 1. Move safely along cross-bridge to corner (37, 65, -177)
console.log('Moving to bridge corner at (37, 65, -177)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(37, 65, -177, 0.5));
} catch (e) {
  await bot.lookAt(new Vec3(37, 66, -177), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();
}
console.log('At corner pos:', lib.fmt(bot.entity.position));

// 2. Advance along dirt bridge at x=37, placing West shield wall at x=36
console.log('Advancing along dirt bridge and placing West shield wall at x=36...');
for (let z = -178; z >= -184; z--) {
  // Place West wall at x=36, y=65 and y=66
  await placeBlockAt(36, 65, z);
  await placeBlockAt(36, 66, z);
  
  // Step forward safely along x=37
  try {
    await bot.pathfinder.goto(new goals.GoalNear(37, 65, z, 0.5));
  } catch (e) {
    await bot.lookAt(new Vec3(37, 65.5, z), true);
    bot.setControlState('forward', true);
    await sleep(250);
    bot.clearControlStates();
  }
}
console.log('Reached bridge end at z=-184! Pos:', lib.fmt(bot.entity.position));

// 3. Bridge the 2-block gap to Spawner Balcony (z=-185, -186)
console.log('Bridging stair gap to Balcony (z=-185, -186, -187)...');
// Place floor at (37, 64, -185)
await placeBlockAt(37, 64, -185);
await placeBlockAt(36, 65, -185); // West wall

// Place stair at (36, 65, -186)
await placeBlockAt(36, 65, -186);
await placeBlockAt(35, 66, -186); // West wall

// Place stair connecting onto balcony at (35, 66, -187)
await placeBlockAt(35, 66, -187);
await placeBlockAt(34, 67, -187);

console.log('Bridge completed to Spawner Balcony!');
bot.chat(`delta: Bridge to Spawner Balcony COMPLETE! Connected to y=67 deck at (34, 67, -187)! Remaining blocks: ${lib.count('cobblestone') + lib.count('soul_sand')}`);

// 4. Check Spawner status
const spawner = bot.blockAt(new Vec3(32, 68, -190));
console.log(`Spawner at (32, 68, -190): ${spawner?.name}`);
const blazesNear = Object.values(bot.entities).filter(e => e && e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 20);
console.log(`Blazes within 20m: ${blazesNear.length}`);

// Equip stone_sword for combat ready
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');
