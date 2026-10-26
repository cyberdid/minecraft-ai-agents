// programs/178-coordinate-obsidian-and-portal.js
console.log('--- Coordinating Milestone 7: Nether Portal ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check Beta
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p && p.entity) {
    console.log(`Beta at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}

// 2. Check base chest
let chest = {};
try {
  chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest error:', e.message);
}

// 3. Check Alpha inventory
console.log('Alpha inventory:', JSON.stringify(lib.inv()));

// 4. Send team message
bot.chat('beta: Milestone 6 recorded! Lava pool is at (333, 62, -78). Frame site at (298, 72, -54). Let us get 10 obsidian and light the portal!');

// 5. Check portal site
const pBlocks = lib.shapes.portal(298, 72, -54, 'x');
console.log('Portal materials still needed:', JSON.stringify(lib.materials(pBlocks)));
