// programs/562-check-team-portal-repair.js
console.log('=== CHECK TEAM REPAIR ACTIONS ===');

for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Player ${name} is at ${lib.fmt(p.entity.position)}`);
    console.log(`  Equipment:`, JSON.stringify(p.entity.equipment));
  }
}

// Check if any obsidian block exists at (299, 72, -54) now
const b = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Block at (299, 72, -54) is now: ${b ? b.name : 'null'}`);

// Check if nether_portal block exists
const portal = bot.findBlock({ matching: bl => bl && bl.name === 'nether_portal', maxDistance: 10 });
console.log(`Nether portal status: ${portal ? 'ACTIVE at ' + lib.fmt(portal.position) : 'INACTIVE'}`);

// Ask in chat
bot.chat('delta: Alpha/Gamma/Beta: Who has diamond pickaxe + water bucket for the 1 obsidian at (333, 62, -78)?');

return { portalActive: !!portal, blockAtSill: b?.name };
