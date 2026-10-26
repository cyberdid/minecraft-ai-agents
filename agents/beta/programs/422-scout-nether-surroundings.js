// programs/422-scout-nether-surroundings.js
console.log('=== Step: Complete bunker roof and scout Nether surroundings for structures ===');
console.log('Current pos in Nether:', lib.fmt(bot.entity.position));

// 1. Place roof blocks above portal frame at y=68..69
const roofCoords = [
  [39, 68, -7], [40, 68, -7], [41, 68, -7], [42, 68, -7],
  [40, 68, -6], [41, 68, -6],
  [40, 68, -8], [41, 68, -8]
];

let roofPlaced = 0;
for (const [rx, ry, rz] of roofCoords) {
  if (isCancelled() || lib.count('cobblestone') < 10) break;
  const b = bot.blockAt(new Vec3(rx, ry, rz));
  if (b && b.name === 'air') {
    try {
      await lib.place('cobblestone', rx, ry, rz);
      roofPlaced++;
      console.log(`Placed roof block at (${rx}, ${ry}, ${rz})`);
    } catch (e) {}
  }
}
console.log(`Roof blocks placed: ${roofPlaced}. Cobblestone remaining: ${lib.count('cobblestone')}`);

// 2. Scan for Nether Fortress blocks within 64 blocks
// Nether fortress materials: nether_bricks, nether_brick_fence, nether_brick_stairs, spawner
const fortressBlockIds = [
  mcData.blocksByName.nether_bricks?.id,
  mcData.blocksByName.nether_brick_fence?.id,
  mcData.blocksByName.nether_brick_stairs?.id,
  mcData.blocksByName.spawner?.id
].filter(Boolean);

const fortressBlocks = bot.findBlocks({
  matching: fortressBlockIds,
  maxDistance: 64,
  count: 20
});

console.log(`Nether fortress blocks found within 64m: ${fortressBlocks.length}`);
if (fortressBlocks.length > 0) {
  console.log(`*** NETHER FORTRESS SPOTTED AT ${lib.fmt(fortressBlocks[0])}! ***`);
  bot.chat(`beta: NETHER FORTRESS SPOTTED at ${lib.fmt(fortressBlocks[0])}!`);
} else {
  console.log('No fortress blocks in immediate 64m view.');
}

// 3. Scan for Bastion blocks (blackstone, polished_blackstone_bricks, gilded_blackstone)
const bastionBlockIds = [
  mcData.blocksByName.polished_blackstone_bricks?.id,
  mcData.blocksByName.gilded_blackstone?.id
].filter(Boolean);

const bastionBlocks = bot.findBlocks({
  matching: bastionBlockIds,
  maxDistance: 64,
  count: 20
});
console.log(`Bastion blocks found within 64m: ${bastionBlocks.length}`);

// 4. Check for teammate Alpha entering the Nether
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log(`Alpha spotted in the Nether at ${lib.fmt(alpha.position)}!`);
}

bot.chat(`beta: Nether bunker roof complete (${roofPlaced} placed). Cobble left: ${lib.count('cobblestone')}. Scanning for fortress!`);
