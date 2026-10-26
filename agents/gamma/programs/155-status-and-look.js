// programs/155-status-and-look.js
console.log('--- STATUS AND ENVIRONMENT SCAN ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));
console.log('Equipment:', JSON.stringify(bot.inventory.slots.map((s, idx) => s ? `${idx}:${s.name}x${s.count}` : null).filter(Boolean)));

// Check nearby players
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username) {
    const pos = p.entity ? lib.fmt(p.entity.position) : 'offline/far';
    console.log(`Player ${p.username}: ${pos}`);
  }
}

// Check nearby blocks (chests, portals, etc.)
const chests = bot.findBlocks({
  matching: b => b.name.includes('chest'),
  maxDistance: 16,
  count: 5
});
console.log('Chests nearby:', chests.map(p => `${lib.fmt(p)}`));

// Check ground items nearby
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 16);
console.log('Items on ground nearby:', items.map(e => `${e.name} at ${lib.fmt(e.position)}`));

// Check nearby portals
const portals = bot.findBlocks({
  matching: b => b.name === 'nether_portal',
  maxDistance: 8,
  count: 5
});
console.log('Portals nearby:', portals.map(p => `${lib.fmt(p)}`));
