// programs/002-inspect-team-and-base.js
console.log('--- Players ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  } else {
    console.log(`Player ${name} (no entity / parked / far)`);
  }
}

// Withdraw 32 cobblestone from chest
const chest = bot.findBlocks({ matching: b => b.name === 'chest', maxDistance: 6, count: 1 })[0];
if (chest) {
  await lib.withdraw({ cobblestone: 32 }, chest.x, chest.y, chest.z);
  console.log('Withdrew 32 cobblestone from chest');
}

// Check the furnaces
const furnaces = bot.findBlocks({
  matching: b => b.name === 'furnace',
  maxDistance: 6,
  count: 5
});
console.log(`Found ${furnaces.length} furnaces`);
for (const f of furnaces) {
  const block = bot.blockAt(f);
  console.log(`Furnace at ${lib.fmt(f)}:`, block.name);
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat('delta: At base. Ready to assist with iron, food, or obsidian!');
