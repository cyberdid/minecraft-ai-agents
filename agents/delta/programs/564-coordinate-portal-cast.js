// programs/564-coordinate-portal-cast.js
console.log('=== COORDINATE PORTAL REPAIR WITH ALPHA & GAMMA ===');

for (const name of ['alpha', 'gamma', 'beta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Player ${name} pos: ${lib.fmt(p.entity.position)}`);
    console.log(`  Equipment:`, JSON.stringify(p.entity.equipment));
  }
}

bot.chat('delta: Alpha: Surface lava pool is at (333, 62, -78). Do you have a bucket for lava cast, or need me to fetch iron/flint?');

// Check nearby gravel / flint
const gravel = bot.findBlocks({ matching: b => b && b.name === 'gravel', maxDistance: 16, count: 5 });
console.log(`Nearby gravel blocks: ${gravel.length}`);

return { gravel: gravel.length };
