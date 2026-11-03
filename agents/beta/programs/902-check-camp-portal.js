console.log('=== Program 902: Check Camp Portal ===');
const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 20,
  count: 10
});
console.log(`Portals within 20m: ${portals.length}`);
for (const p of portals) {
  console.log(`  portal block at ${lib.fmt(p)}`);
}
