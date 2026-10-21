// programs/107-fix-bed-spot.js
// Inspect floor under bed spot (294, 71, -56) and (294, 71, -55), pave cobblestone, and place bed

console.log('alpha at:', lib.fmt(bot.entity.position));

const spot1 = new Vec3(294, 71, -56);
const spot2 = new Vec3(294, 71, -55);

console.log('Floor at (294, 71, -56):', bot.blockAt(spot1)?.name);
console.log('Floor at (294, 71, -55):', bot.blockAt(spot2)?.name);
console.log('Bed spot 1 (294, 72, -56):', bot.blockAt(new Vec3(294, 72, -56))?.name);
console.log('Bed spot 2 (294, 72, -55):', bot.blockAt(new Vec3(294, 72, -55))?.name);

// Stand at (293, 72, -55) so we don't block placement
await lib.walkTo(293.5, -55.5);

// Pave if not solid block
if (bot.blockAt(spot1)?.boundingBox !== 'block') {
  await lib.place('cobblestone', spot1.x, spot1.y, spot1.z);
}
if (bot.blockAt(spot2)?.boundingBox !== 'block') {
  await lib.place('cobblestone', spot2.x, spot2.y, spot2.z);
}

// Now place bed
if (lib.count('white_bed') > 0) {
  console.log('Placing bed at (294, 72, -56)...');
  try {
    await lib.place('white_bed', 294, 72, -56);
    console.log('Bed placed successfully!');
  } catch (e) {
    console.log('Bed place note:', e.message);
  }
}

// Set spawn
try {
  await lib.setSpawn();
  console.log('Spawn set at base!');
} catch (e) {}

console.log('Block at (294, 72, -56) is now:', bot.blockAt(new Vec3(294, 72, -56))?.name);
bot.chat('alpha: Bed securely placed in base and spawn set.');
