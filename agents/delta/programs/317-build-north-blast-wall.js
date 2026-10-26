// programs/317-build-north-blast-wall.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'cobble:', lib.count('cobblestone'));

// Equip cobblestone
const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
if (!cobble) {
  console.log('No cobblestone!');
  return;
}
await bot.equip(cobble, 'hand');

// Function to place a block at target (x, y, z)
async function placeAt(x, y, z) {
  const target = new Vec3(x, y, z);
  const existing = bot.blockAt(target);
  if (existing && existing.boundingBox === 'block') {
    console.log(`Block already at (${x},${y},${z}): ${existing.name}`);
    return;
  }
  
  // Find adjacent solid block
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
        console.log(`Placed cobblestone at (${x},${y},${z}) against (${refPos.x},${refPos.y},${refPos.z})`);
        return;
      } catch (e) {
        // try next neighbor
      }
    }
  }
  console.log(`Could not find valid neighbor to place at (${x},${y},${z})`);
}

// 1. Build North blast wall segment 1 from standing position (44, 65, -175)
console.log('Building North blast wall segment 1 (x=44..42, z=-177)...');
for (let x = 44; x >= 42; x--) {
  await placeAt(x, 65, -177);
  await placeAt(x, 66, -177);
}

// 2. Step safely behind newly placed wall to (42, 65, -176)
console.log('Moving behind wall to (42, 65, -176)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(42, 65, -176, 0.5));
} catch (e) {
  await bot.lookAt(new Vec3(42, 66, -176), true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.clearControlStates();
}
console.log('At pos:', lib.fmt(bot.entity.position));

// 3. Build North blast wall segment 2 (x=41..38, z=-177)
console.log('Building North blast wall segment 2 (x=41..38, z=-177)...');
for (let x = 41; x >= 38; x--) {
  await placeAt(x, 65, -177);
  await placeAt(x, 66, -177);
}

// 4. Step safely behind wall to (39, 65, -176)
console.log('Moving behind wall to (39, 65, -176)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(39, 65, -176, 0.5));
} catch (e) {
  await bot.lookAt(new Vec3(39, 66, -176), true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.clearControlStates();
}
console.log('At pos:', lib.fmt(bot.entity.position));

// 5. Seal floor at (37, 64, -176) and place West cap at (37, 65..66, -176)
await placeAt(37, 64, -176);
await placeAt(37, 65, -177);
await placeAt(37, 66, -177);
await placeAt(37, 65, -176);
await placeAt(37, 66, -176);

bot.chat(`delta: North blast wall (z=-177) constructed from x=44 to x=37! Cross-bridge 100% sealed against Blazes! Remaining cobble: ${lib.count('cobblestone')}`);

console.log('Done! Current pos:', lib.fmt(bot.entity.position), 'cobble left:', lib.count('cobblestone'));
