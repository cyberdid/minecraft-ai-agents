// programs/873-monitor-alpha-and-delta.js
console.log('=== Program 873: Monitor Alpha, Delta, Gamma & Portal ===');

for (const [name, pl] of Object.entries(bot.players)) {
  if (pl && pl.entity) {
    console.log(`Player ${name} at ${lib.fmt(pl.entity.position)} held: ${pl.entity.heldItem ? pl.entity.heldItem.name : 'empty'}`);
  } else {
    console.log(`Player ${name} not in visual range or underground`);
  }
}

const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Sill at (299, 72, -54): ${sill ? sill.name : 'null'}`);

const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
console.log(`Nether portal blocks: ${portals.length}`);

bot.chat('Beta: Standing at portal frame (297.5, 72, -55.5). Basin is 100% sealed mold & dry!');
