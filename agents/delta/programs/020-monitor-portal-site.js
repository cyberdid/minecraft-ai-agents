// programs/020-monitor-portal-site.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Walk to portal frame at (298, 72, -54)
await lib.goTo(297, 72, -52, 2);
console.log('At portal vicinity:', lib.fmt(bot.entity.position));

// Check portal frame shape
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mats = lib.materials(frame);
console.log('Portal materials:', JSON.stringify(mats));

// Check for nether_portal block
const portals = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 16, count: 5 });
console.log(`Active nether_portal blocks: ${portals.length}`);

// Check all teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

// Check nearby hostiles
const hostiles = lib.hostiles(24);
console.log(`Hostiles nearby (24m): ${hostiles.length}`);
for (const h of hostiles) {
  console.log(`  Hostile: ${h.name} at ${lib.fmt(h.pos)} dist=${h.dist}`);
}

bot.chat('delta: Guarding portal site (298, 72, -54). Ready to assist Beta with portal completion!');
