// programs/069-enter-nether.js
console.log('--- ENTERING THE NETHER ---');
console.log('Current pos:', lib.fmt(bot.entity.position));
console.log('Current dim:', bot.game.dimension);

// 1. Withdraw additional building blocks from chest if available
try {
  const chest = await lib.chestContents(293, 72, -57);
  if (chest.cobbled_deepslate >= 32) {
    await lib.withdraw({ cobbled_deepslate: 32 }, 293, 72, -57);
    console.log('Withdrew 32 cobbled_deepslate');
  }
} catch (e) {
  console.log('Chest withdraw note:', e.message);
}

// 2. Step outside base door
console.log('Exiting base door (294, 72, -54)...');
await lib.goThroughDoor(294, 72, -54);
console.log('Outside door at:', lib.fmt(bot.entity.position));

// 3. Move into Nether portal at (299.5, 73.0, -54.0)
console.log('Approaching Nether portal at (299, 73, -54)...');
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
console.log('At portal block! pos:', lib.fmt(bot.entity.position));

// Wait for Nether transition
const startTransit = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - startTransit < 30000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (String(bot.game.dimension).includes('nether')) {
  console.log('SUCCESS! Arrived in the Nether!');
  console.log('Dimension:', bot.game.dimension);
  console.log('Position:', lib.fmt(bot.entity.position));
  console.log('Health:', bot.health, 'Food:', bot.food);

  // Teammates in the Nether
  for (const [name, p] of Object.entries(bot.players)) {
    if (name !== 'gamma' && p.entity) {
      console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}`);
    }
  }

  bot.chat(`gamma has arrived in the Nether at ${lib.fmt(bot.entity.position)}! Dimension: ${bot.game.dimension}`);
} else {
  console.log('Portal transit did not complete within 30s. Current dim:', bot.game.dimension);
}
