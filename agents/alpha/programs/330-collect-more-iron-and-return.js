// programs/330-collect-more-iron-and-return.js
console.log('=== Program 330: Collect More Iron & Return to Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Collect 6 more iron ore nearby
try {
  console.log('Collecting 6 more iron ore...');
  const got = await lib.collect('iron_ore', 6);
  console.log('Collected:', JSON.stringify(got));
} catch (e) {
  console.log('Collect note:', e.message);
}

console.log('Total raw_iron now:', lib.count('raw_iron'));

// 2. Head back to base (294, 72, -54)
console.log('Returning to base...');
try {
  await lib.goTo(294, 72, -54, 2, { timeoutMs: 30000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely back inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Return to base note:', e.message);
}

// 3. Deposit raw iron into base furnace to smelt with coal
try {
  const ironCount = lib.count('raw_iron');
  const coalCount = lib.count('coal');
  if (ironCount > 0 && coalCount > 0) {
    console.log(`Smelting ${ironCount} raw_iron with coal...`);
    const res = await lib.smelt('raw_iron', 'coal', ironCount);
    console.log('Smelt result:', JSON.stringify(res));
  }
} catch (e) {
  console.log('Smelt note:', e.message);
}

console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`team: Alpha back at base with ${lib.count('iron_ingot')} iron ingots and ${lib.count('raw_iron')} raw iron!`);
