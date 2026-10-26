// programs/283-status-and-team-check.js
console.log('=== GAMMA STATUS & TEAM CHECK ===');
console.log('Status:', JSON.stringify(lib.status()));
console.log('Tools:', JSON.stringify(lib.tools()));

console.log('\n--- PLAYERS ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}, ping=${p.ping}`);
  } else {
    console.log(`Player ${name}: no entity (different dimension or far away)`);
  }
}

console.log('\n--- HOSTILES ---');
console.log(JSON.stringify(lib.hostiles(24)));

return {
  pos: bot.entity.position,
  inv: lib.inv(),
  dim: bot.game.dimension
};
