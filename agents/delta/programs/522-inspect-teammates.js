// programs/522-inspect-teammates.js
console.log('=== INSPECT TEAMMATES & BUNKER ===');

for (const name of ['alpha', 'gamma', 'beta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    const eq = p.entity.equipment;
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}:`);
    console.log(`  equipment:`, JSON.stringify(eq));
  } else {
    console.log(`Player ${name} has no entity nearby.`);
  }
}

// Check if any chest or barrel is in the fortress bunker
const blocks = bot.findBlocks({
  matching: b => b && ['chest', 'barrel', 'trapped_chest'].includes(b.name),
  maxDistance: 32,
  count: 10
});
console.log(`Chests nearby: ${blocks.length}`);
for (const b of blocks) {
  console.log(`  Chest at ${lib.fmt(b)}`);
}

// Ask in chat
bot.chat('delta: At bunker (44, 65, -126). Status update: need pearls/gold/food?');

return { teammates: ['alpha', 'gamma', 'beta'].map(n => ({ name: n, p: bot.players[n]?.entity?.position })) };
