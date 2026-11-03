console.log('=== INSPECT PORTAL FRAME AND SURROUNDINGS ===');
const frameCoords = [];
for (let x = 298; x <= 301; x++) {
  for (let y = 72; y <= 76; y++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    frameCoords.push(`(${x},${y},-54): ${b ? b.name : 'null'}`);
  }
}
console.log('Portal frame blocks:\n' + frameCoords.join('\n'));

// Check for players nearby
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log('Nearby players:', players.map(p => `${p.username} at ${lib.fmt(p.position)} (dist ${p.position.distanceTo(bot.entity.position).toFixed(1)})`));

// Check if nether_portal already exists
const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
console.log('Portal active:', portal ? lib.fmt(portal.position) : 'NO');

// Check block at sill (299, 72, -54)
const sill = bot.blockAt(new Vec3(299, 72, -54));
const sill2 = bot.blockAt(new Vec3(300, 72, -54));
console.log(`Sill 1 (299,72,-54): ${sill ? sill.name : 'null'}, Sill 2 (300,72,-54): ${sill2 ? sill2.name : 'null'}`);

if (sill && sill.name === 'obsidian' && sill2 && sill2.name === 'obsidian' && !portal) {
  console.log('Obsidian is complete! Igniting portal...');
  try {
    await lib.ignite(299, 72, -54);
    await sleep(800);
    const pNow = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
    console.log('Ignite result:', pNow ? 'SUCCESS' : 'FAILED');
    if (pNow) {
      bot.chat('delta: NETHER PORTAL IGNITED! Ready to warp!');
    }
  } catch (err) {
    console.log('Ignite error:', err.message);
  }
}
