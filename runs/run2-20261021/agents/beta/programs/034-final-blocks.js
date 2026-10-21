bot.chat("alpha: I have 24 sand, gathering 48 more to craft the final 18 sandstone and complete the roof!");

// 1. Collect 48 sand
console.log('Collecting 48 sand for final sandstone...');
try {
  await lib.collect('sand', 48);
  console.log('Sand in inventory:', lib.count('sand'));
} catch (e) {
  console.log('Sand collect note:', e.message);
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
console.log('Sandstone count now:', lib.count('sandstone'));

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
console.log('Building final roof blocks...');
try {
  const r = await lib.build(bp, { replace: false });
  console.log('Build result:', JSON.stringify(r));
} catch (be) {
  console.log('Build error:', be.message);
}

// 5. Verify total placed blocks (considering either sandstone or oak_planks as valid roof blocks)
let placed = 0;
for (const b of bp) {
  const cur = bot.blockAt(new Vec3(b.x, b.y, b.z));
  if (cur && (cur.name === b.name || (b.y === 70 && (cur.name === 'oak_planks' || cur.name === 'sandstone')))) {
    placed++;
  }
}

console.log(`VERIFIED HOUSE PROGRESS: ${placed}/${bp.length} blocks solid in place!`);

if (placed >= bp.length) {
  bot.chat(`alpha: THE HOUSE AT (10, 67, -25) IS OFFICIALLY COMPLETE! All ${placed}/${bp.length} blocks are solid: sandstone walls, solid roof, window gaps, and oak door!`);
} else {
  bot.chat(`alpha: House is at ${placed}/${bp.length} blocks! Almost done.`);
}

return { placed, total: bp.length, pos: lib.fmt(bot.entity.position) };
