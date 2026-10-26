// programs/514-place-baffle-and-inspect-blaze.js
console.log('=== Program 514: Place Baffle Wall & Inspect Blaze ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.pathfinder.stop();
await sleep(100);

// 1. Immediately place solid baffle wall at z=-158 to block line of sight from the Blaze at 15m!
console.log('Placing solid cobblestone baffle wall at (44, 65..66, -158)...');
try {
  // Check if floor exists at (44, 64, -158)
  const floor158 = bot.blockAt(new Vec3(44, 64, -158));
  console.log('Floor at (44, 64, -158):', floor158 ? floor158.name : 'null');
  if (!floor158 || floor158.name === 'air') {
    await lib.place('cobblestone', 44, 64, -158);
  }
  
  // Place lower wall block at (44, 65, -158)
  const wallLower = bot.blockAt(new Vec3(44, 65, -158));
  if (!wallLower || wallLower.name === 'air') {
    await lib.place('cobblestone', 44, 65, -158);
    console.log('Placed lower wall at (44, 65, -158)!');
  }

  // Place upper wall block at (44, 66, -158)
  const wallUpper = bot.blockAt(new Vec3(44, 66, -158));
  if (!wallUpper || wallUpper.name === 'air') {
    await lib.place('cobblestone', 44, 66, -158);
    console.log('Placed upper wall at (44, 66, -158)!');
  }
} catch (err) {
  console.log('Baffle placement note:', err.message);
}

// 2. Scan hostiles and blazes
const hostiles = lib.hostiles(24);
console.log(`Hostiles nearby (${hostiles.length}):`);
for (const h of hostiles) {
  console.log(`  ${h.name} at ${lib.fmt(h.pos)} (dist ${h.dist.toFixed(1)}m)`);
}

// 3. Scan corridor layout around z=-155..-165
console.log('Corridor Scan (z from -156 to -165):');
for (let z = -156; z >= -165; z--) {
  const f = bot.blockAt(new Vec3(44, 64, z))?.name || 'air';
  const wL = bot.blockAt(new Vec3(43, 65, z))?.name || 'air';
  const wR = bot.blockAt(new Vec3(45, 65, z))?.name || 'air';
  const c = bot.blockAt(new Vec3(44, 65, z))?.name || 'air';
  const r = bot.blockAt(new Vec3(44, 67, z))?.name || 'air';
  console.log(`z=${z}: floor(y=64)=${f}, west(x=43)=${wL}, center=${c}, east(x=45)=${wR}, roof(y=67)=${r}`);
}

// 4. Report status & inventory
console.log('Cobblestone count:', lib.count('cobblestone'));
console.log('Alpha HP:', bot.health, 'Food:', bot.food);
