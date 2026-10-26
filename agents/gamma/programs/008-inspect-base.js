// programs/008-inspect-base.js
console.log('gamma pos:', lib.fmt(bot.entity.position));
const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
console.log('Door block at (294, 72, -54):', doorBlock ? doorBlock.name : 'null');

// Step inside away from doorway
await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -56));
console.log('Now at:', lib.fmt(bot.entity.position));

// Inspect chest at (293, 72, -57)
const chest = await lib.chestContents(293, 72, -57);
console.log('Base chest contents:', JSON.stringify(chest));

// Check players
for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat(`gamma inside base. Chest has: ${JSON.stringify(chest)}. Beta ascending with 10 obsidian!`);
