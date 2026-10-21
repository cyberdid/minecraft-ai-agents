bot.chat("alpha: Gathering 60 sand right here to craft sandstone and finish the roof!");

// 1. Gather 60 sand
console.log('Gathering sand...');
try {
  await lib.collect('sand', 60);
  console.log('Sand in inventory:', lib.count('sand'));
} catch (e) {
  console.log('Sand gather note:', e.message);
}

// 2. Craft sandstone
const sand = lib.count('sand');
if (sand >= 4) {
  const crafts = Math.floor(sand / 4);
  console.log(`Crafting ${crafts} sandstone from ${sand} sand...`);
  try {
    await lib.craft('sandstone', crafts);
  } catch (ce) {
    console.log('Craft note:', ce.message);
  }
}
console.log('Sandstone in inventory:', lib.count('sandstone'));

// 3. Define blueprint
const bp = lib.shapes.house({
  x: 10,
  y: 67,
  z: -25,
  width: 5,
  depth: 5,
  height: 3,
  wall: 'sandstone',
  roof: 'sandstone',
  door: 'south',
  windows: true
});

// 4. Build remaining blocks
console.log('Building roof blocks...');
try {
  const r = await lib.build(bp, { replace: false });
  console.log('Build result:', JSON.stringify(r));
} catch (be) {
  console.log('Build error:', be.message);
}

// 5. Verify total placed blocks
let placed = 0;
for (const b of bp) {
  const cur = bot.blockAt(new Vec3(b.x, b.y, b.z));
  if (cur && cur.name === b.name) placed++;
}
console.log(`FINAL HOUSE PROGRESS: ${placed}/${bp.length} blocks placed!`);

if (placed >= bp.length) {
  bot.chat(`alpha: The house at (10, 67, -25) is COMPLETE! All ${placed}/${bp.length} blocks placed with walls, roof, windows, and oak door!`);
} else {
  bot.chat(`alpha: House progress: ${placed}/${bp.length} blocks. Only ${bp.length - placed} roof blocks left!`);
}

return { placed, total: bp.length, inventory: lib.inv() };
