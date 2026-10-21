function getBlueprint() {
  return lib.shapes.house({
    x: 10,
    y: 67,
    z: -25,
    width: 5,
    depth: 5,
    height: 3,
    wall: 'sandstone',
    roof: 'oak_planks',
    door: 'south',
    windows: true
  });
}

// 1. Craft sandstone from sand (4 sand -> 1 sandstone)
const sandCount = lib.count('sand');
if (sandCount >= 4) {
  const crafts = Math.floor(sandCount / 4);
  console.log(`Crafting ${crafts} sandstone from ${sandCount} sand...`);
  await lib.craft('sandstone', crafts);
}
console.log('Sandstone count now:', lib.count('sandstone'));

// 2. Build whatever sandstone wall blocks we can
const bp = getBlueprint();
const sandstoneBlocks = bp.filter(b => b.name === 'sandstone');
console.log('Placing available sandstone blocks...');
const buildRes = await lib.build(sandstoneBlocks, { replace: false });
console.log('Sandstone build result:', JSON.stringify(buildRes));

// 3. Ensure crafting table at base
const tableSpot = new Vec3(9, 67, -24);
try {
  await lib.place('crafting_table', tableSpot.x, tableSpot.y, tableSpot.z);
  console.log('Placed crafting table at', lib.fmt(tableSpot));
} catch (e) {
  console.log('Table spot note:', e.message);
}

// 4. Ensure shared chest at base
const chestSpot = new Vec3(9, 67, -23);
try {
  if (lib.count('chest') < 1 && lib.count('oak_planks') >= 8) {
    await lib.craft('chest', 1);
  }
  if (lib.count('chest') >= 1) {
    await lib.place('chest', chestSpot.x, chestSpot.y, chestSpot.z);
    console.log('Placed shared chest at', lib.fmt(chestSpot));
  }
} catch (e) {
  console.log('Chest spot note:', e.message);
}

// Check house progress
let placed = 0;
for (const b of bp) {
  const cur = bot.blockAt(new Vec3(b.x, b.y, b.z));
  if (cur && cur.name === b.name) placed++;
}

console.log(`Current progress: ${placed}/${bp.length} blocks placed`);
bot.chat(`alpha: Placed sandstone foundation! Progress: ${placed}/${bp.length}. I placed shared chest & table at (9, 67, -23).`);

return { placed, total: bp.length };
