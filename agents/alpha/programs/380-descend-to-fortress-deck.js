// programs/380-descend-to-fortress-deck.js
console.log('=== Program 380: Inspect Fortress Column & Descend to Deck ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Inspect vertical column below Alpha (45, y, -116)
console.log('Inspecting vertical column at (45, y, -116):');
let fortressFloorY = null;
for (let y = 65; y >= 45; y--) {
  const b = bot.blockAt(new Vec3(45, y, -116));
  const bNorth = bot.blockAt(new Vec3(45, y, -117));
  const bEast = bot.blockAt(new Vec3(46, y, -116));
  console.log(`  y=${y}: (45,-116)=${b?.name}, north=${bNorth?.name}, east=${bEast?.name}`);
  if (!fortressFloorY && b && b.name.includes('nether_brick') && b.boundingBox === 'block') {
    // Check if block above is air (walkable floor)
    const above = bot.blockAt(new Vec3(45, y + 1, -116));
    if (above && above.name === 'air') {
      fortressFloorY = y + 1;
      console.log(`  --> Walkable fortress floor detected at y=${fortressFloorY}!`);
    }
  }
}

// 2. Also check column at (49, y, -116) where Alpha was earlier
console.log('Inspecting vertical column at (49, y, -116):');
for (let y = 65; y >= 50; y--) {
  const b = bot.blockAt(new Vec3(49, y, -116));
  if (b && b.name.includes('nether_brick')) {
    console.log(`  (49, ${y}, -116): ${b.name}`);
  }
}

// 3. Scan for any walkable path down to fortress floor
const walkableBrick = bot.findBlocks({
  matching: (b) => {
    if (!b || !b.name.includes('nether_brick')) return false;
    const up = bot.blockAt(b.position.offset(0, 1, 0));
    const up2 = bot.blockAt(b.position.offset(0, 2, 0));
    return up && up.name === 'air' && up2 && up2.name === 'air';
  },
  maxDistance: 24,
  count: 10
});

console.log(`Found ${walkableBrick.length} walkable fortress floor blocks within 24m:`);
for (const wb of walkableBrick.slice(0, 5)) {
  console.log(`  Walkable floor at: ${lib.fmt(wb)} (dist: ${bot.entity.position.distanceTo(wb).toFixed(1)}m)`);
}

// 4. If a close walkable floor exists, descend towards it
if (walkableBrick.length > 0) {
  const target = walkableBrick[0];
  console.log(`Descending to nearest walkable fortress floor at ${lib.fmt(target)}...`);
  try {
    await lib.goTo(target.x, target.y + 1, target.z, 1, { timeoutMs: 25000 });
    console.log('Successfully descended to fortress deck! Now at:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Descent note:', e.message);
  }
}

// 5. Scan for nearby teammates (Gamma arriving!)
for (const name of ['gamma', 'delta', 'beta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
  }
}

bot.chat(`team: Alpha descending into Fortress! Position: ${lib.fmt(bot.entity.position)}. Walkable deck blocks: ${walkableBrick.length}.`);

console.log('Alpha status:', JSON.stringify(lib.status()));
