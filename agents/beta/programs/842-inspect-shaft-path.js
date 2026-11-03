// programs/842-inspect-shaft-path.js
console.log('=== Program 842: Inspect Shaft Staircase & Lava Path ===');
globalThis.isProgramCancelled = isCancelled;

const p = bot.entity.position;
console.log(`Current pos: ${lib.fmt(p)}`);

// Move to mine entrance at (302, 71, -44)
await lib.goTo(302, 71, -44, 1.5, { timeoutMs: 10000 });
console.log(`At mine entrance: ${lib.fmt(bot.entity.position)}`);

// Look down the shaft and inspect walkable floor from y=71 down to y=45
for (let y = 71; y >= 45; y--) {
  // Find air blocks with solid block below
  const airBlocks = [];
  for (let x = 298; x <= 316; x++) {
    for (let z = -48; z <= -30; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      const below = bot.blockAt(new Vec3(x, y - 1, z));
      const above = bot.blockAt(new Vec3(x, y + 1, z));
      if (b && b.name === 'air' && above && above.name === 'air' && below && below.boundingBox === 'block') {
        airBlocks.push(`(${x},${y},${z}): floor=${below.name}`);
      }
    }
  }
  if (airBlocks.length > 0 && y % 3 === 0) {
    console.log(`y=${y}: ${airBlocks.slice(0, 4).join(', ')}${airBlocks.length > 4 ? ` (+${airBlocks.length - 4} more)` : ''}`);
  }
}

// Check what Alpha, Gamma, Delta are doing
for (const [name, pl] of Object.entries(bot.players)) {
  if (pl && pl.entity) {
    console.log(`Player ${name} at ${lib.fmt(pl.entity.position)}`);
  }
}
