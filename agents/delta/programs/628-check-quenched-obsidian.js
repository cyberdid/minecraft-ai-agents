console.log('=== CHECK QUENCHED OBSIDIAN ===');
const obsBlocks = bot.findBlocks({ matching: b => b && b.name === 'obsidian', maxDistance: 10, count: 20 });
console.log(`Found ${obsBlocks.length} obsidian blocks nearby:`, obsBlocks.map(p => lib.fmt(p)));

const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Sill (299, 72, -54): ${sill ? sill.name : 'null'}`);

const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
console.log('Portal active:', portal ? 'YES' : 'NO');

// If sill is obsidian, ignite!
if (sill && sill.name === 'obsidian' && !portal) {
  console.log('Sill is obsidian! Igniting with flint_and_steel...');
  try {
    await lib.ignite(299, 72, -54);
    await sleep(600);
    const p = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
    if (p) {
      bot.chat('delta: NETHER PORTAL IGNITED BY DELTA! Entering portal now!');
      await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
      await sleep(4500);
    }
  } catch (e) {
    console.log('Ignite error:', e.message);
  }
}
