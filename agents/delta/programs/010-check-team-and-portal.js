// programs/010-check-team-and-portal.js
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  } else {
    console.log(`Player ${name} (far or offline)`);
  }
}

// Check base chest
const chest = bot.findBlocks({ matching: b => b.name === 'chest', maxDistance: 6, count: 1 })[0];
if (chest) {
  const contents = await lib.chestContents(chest.x, chest.y, chest.z);
  console.log('Chest contents:', JSON.stringify(contents));
}

// Check portal frame
const portalFrame = lib.shapes.portal(298, 72, -54, 'x');
const portalMats = lib.materials(portalFrame);
console.log('Portal frame status:', JSON.stringify(portalMats));

// Check if nether_portal block exists
const portals = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 16, count: 1 });
console.log('Lit portal blocks found:', portals.length);
