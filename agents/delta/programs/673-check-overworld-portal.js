console.log('=== CHECK OVERWORLD NETHER PORTAL ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}`);

const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 6,
  count: 10
});

console.log(`Portal blocks found: ${portals.length}`);
for (const p of portals) {
  console.log(`  Portal: ${lib.fmt(p)}`);
}

const obsidians = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 6,
  count: 20
});
console.log(`Obsidians found: ${obsidians.length}`);
for (const o of obsidians) {
  console.log(`  Obsidian: ${lib.fmt(o)}`);
}
