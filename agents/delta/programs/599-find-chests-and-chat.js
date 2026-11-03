console.log('=== SEARCH FOR CHESTS & CHAT ===');
const chests = bot.findBlocks({ matching: b => b && (b.name === 'chest' || b.name === 'trapped_chest' || b.name === 'barrel'), maxDistance: 48, count: 10 });
console.log(`Found ${chests.length} chests/barrels:`, chests.map(p => lib.fmt(p)));

// Tell Beta and Alpha about lava & obsidian
bot.chat('delta: Beta: Surface pool (333, 62, -78) is dry. Lava lake is down shaft (302, 71, -44) at y=18 (286, 18, 8)!');
bot.chat('delta: Alpha: With your diamond pickaxe, mining 1 obsidian block to place at (299, 72, -54) is 100% reliable!');

const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
for (const p of players) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem ? p.heldItem.name : 'empty'}`);
}
