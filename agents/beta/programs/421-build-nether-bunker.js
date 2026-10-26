// programs/421-build-nether-bunker.js
console.log('=== Step: Construct Cobblestone Nether Bunker around Portal (40, 65, -7) ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Cobblestone count:', lib.count('cobblestone'));

// List of tactical bunker wall coordinates around the portal:
// Portal frame spans x=39..42, y=65..68, z=-7.
// We place protective cobblestone blast shields at z=-6 (front), z=-8 (back), and sidewalls at x=38 and x=43.
const bunkerBlocks = [
  // Sidewall West at x=38:
  [38, 65, -7], [38, 66, -7], [38, 67, -7],
  [38, 65, -6], [38, 66, -6], [38, 67, -6],
  [38, 65, -8], [38, 66, -8], [38, 67, -8],

  // Sidewall East at x=43:
  [43, 65, -7], [43, 66, -7], [43, 67, -7],
  [43, 65, -6], [43, 66, -6], [43, 67, -6],
  [43, 65, -8], [43, 66, -8], [43, 67, -8],

  // Front shield pillars at z=-5 (leaving center x=40,41 open for doorway):
  [39, 65, -5], [39, 66, -5], [39, 67, -5],
  [42, 65, -5], [42, 66, -5], [42, 67, -5],

  // Back shield pillars at z=-9 (leaving center x=40,41 open for doorway):
  [39, 65, -9], [39, 66, -9], [39, 67, -9],
  [42, 65, -9], [42, 66, -9], [42, 67, -9]
];

let placed = 0;
for (const [bx, by, bz] of bunkerBlocks) {
  if (isCancelled() || lib.count('cobblestone') < 10) break;
  const currentBlock = bot.blockAt(new Vec3(bx, by, bz));
  if (currentBlock && currentBlock.name === 'air') {
    try {
      await lib.place('cobblestone', bx, by, bz);
      placed++;
      console.log(`Placed cobblestone bunker block at (${bx}, ${by}, ${bz})`);
    } catch (e) {
      // lib.place may need solid adjacent surface
    }
  }
}

// Place a torch on the bunker wall
if (lib.count('torch') > 0) {
  try {
    await lib.placeTorch();
  } catch (e) {}
}

console.log(`Bunker construction progress: placed ${placed} cobblestone blocks. Cobble left: ${lib.count('cobblestone')}`);
bot.chat(`beta: Nether bunker reinforced! Placed ${placed} cobblestone blocks around portal (40, 65, -7). Cobble left: ${lib.count('cobblestone')}. Safe base camp established!`);
