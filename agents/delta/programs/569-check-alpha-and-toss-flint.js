// programs/569-check-alpha-and-toss-flint.js
console.log('=== DELTA: ASSIST ALPHA & BETA WITH PORTAL REPAIR ===');

// Check teammates
for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)})`);
    console.log(`  Equipment:`, JSON.stringify(p.entity.equipment));
    
    // If Alpha is within 5m and Delta has flint, toss flint to Alpha!
    if (name === 'alpha' && bot.entity.position.distanceTo(p.entity.position) <= 6.0 && lib.count('flint') > 0) {
      console.log('Tossing flint to Alpha...');
      const flint = bot.inventory.items().find(i => i.name === 'flint');
      if (flint) {
        await bot.lookAt(p.entity.position.offset(0, 1.2, 0), true);
        await bot.toss(flint.type, null, flint.count);
        bot.chat(`delta: Alpha, tossed you ${flint.count} flint for flint_and_steel!`);
      }
    }
  } else {
    console.log(`Teammate ${name} has no entity nearby.`);
  }
}

// Check portal sill at (299, 72, -54)
const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Portal sill block at (299, 72, -54): ${sill ? sill.name : 'null'}`);

// Check if nether_portal exists
const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
console.log(`Nether portal status: ${portal ? 'ACTIVE at ' + lib.fmt(portal.position) : 'INACTIVE'}`);

return { sill: sill?.name, portalActive: !!portal };
