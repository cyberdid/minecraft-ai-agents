// programs/073-reach-fortress-and-join-alpha.js
console.log('--- ADVANCING TO NETHER FORTRESS ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

bot.chat('Gamma advancing along y=65 high ridge to Alpha at Fortress (49, 65, -116)...');

// 1. Waypoint to (52, 65, -90)
console.log('Moving to waypoint (52, 65, -90)...');
try {
  await lib.goTo(52, 65, -90, 3, { timeoutMs: 30000 });
  console.log('At waypoint (52, 65, -90):', lib.fmt(bot.entity.position));
  if (lib.count('torch') > 0) {
    try { await lib.placeTorch(); } catch (e) {}
  }
} catch (e) {
  console.log('Waypoint note:', e.message);
}

// 2. Reach Alpha at Fortress (49, 65, -116)
console.log('Moving to Alpha at Fortress (49, 65, -116)...');
try {
  await lib.goTo(49, 65, -116, 2, { timeoutMs: 40000 });
  console.log('ARRIVED AT NETHER FORTRESS! Pos:', lib.fmt(bot.entity.position));
  if (lib.count('torch') > 0) {
    try { await lib.placeTorch(); } catch (e) {}
  }
} catch (e) {
  console.log('Fortress arrival note:', e.message);
}

// 3. Scan for Fortress blocks & spawners
const pos = bot.entity.position.floored();
const fortressBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'nether_bricks' || b.name === 'nether_brick_fence' || b.name === 'nether_brick_stairs' || b.name === 'spawner'),
  maxDistance: 24,
  count: 30
});
console.log(`Fortress blocks detected within 24m: ${fortressBlocks.length}`);

// 4. Check for spawners
const spawners = bot.findBlocks({
  matching: b => b && b.name === 'spawner',
  maxDistance: 32,
  count: 5
});
console.log(`Spawners detected: ${spawners.length}`);
for (const sp of spawners) {
  console.log(`- Spawner at ${lib.fmt(sp)}`);
}

// 5. Check hostiles
const hostiles = lib.hostiles(20);
console.log('Hostiles within 20m:', JSON.stringify(hostiles));

// 6. Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
  }
}

bot.chat(`gamma at Fortress ${lib.fmt(bot.entity.position)}! Fortress blocks: ${fortressBlocks.length}, Spawners: ${spawners.length}. Health: ${bot.health}`);
