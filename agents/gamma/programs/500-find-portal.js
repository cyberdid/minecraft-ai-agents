// programs/500-find-portal.js
const portals = bot.findBlocks({ matching: b => b && b.name.includes('portal'), maxDistance: 32, count: 10 });
console.log('Portals found within 32 blocks:', portals.length);
for (const p of portals) {
  console.log(`- ${bot.blockAt(p)?.name} at ${lib.fmt(p)}`);
}
const tables = bot.findBlocks({ matching: b => b && b.name.includes('crafting'), maxDistance: 32, count: 10 });
console.log('Crafting tables found:', tables.length);
for (const t of tables) {
  console.log(`- table at ${lib.fmt(t)}`);
}
