// programs/209-inspect-underground-state.js
console.log('=== Alpha Inspection Program 209 ===');
console.log('Position:', lib.fmt(bot.entity.position));
console.log('Status:', JSON.stringify(lib.status()));

// Check beta
if (bot.players.beta) {
  const betaPos = bot.players.beta.entity?.position;
  console.log('Beta found in players list! Pos:', betaPos ? lib.fmt(betaPos) : 'entity not loaded');
} else {
  console.log('Beta not found in players list.');
}

// Find any furnace within 16 blocks
const furnaces = lib.find('furnace', { maxDistance: 16, count: 5 });
console.log(`Found ${furnaces.length} furnaces within 16 blocks.`);
for (const f of furnaces) {
  console.log(`Furnace at ${lib.fmt(f.position)}`);
  try {
    const furnBlock = bot.blockAt(f.position);
    const furn = await bot.openFurnace(furnBlock);
    console.log(`  Furnace items: input=${furn.inputItem()?.name}x${furn.inputItem()?.count}, fuel=${furn.fuelItem()?.name}x${furn.fuelItem()?.count}, output=${furn.outputItem()?.name}x${furn.outputItem()?.count}`);
    // If there is output or input we need, take them
    if (furn.outputItem()) {
      await furn.takeOutput();
      console.log('  Took output from furnace!');
    }
    if (furn.inputItem()) {
      await furn.takeInput();
      console.log('  Took input back from furnace!');
    }
    furn.close();
  } catch (err) {
    console.log('  Error reading furnace:', err.message);
  }
}

// Check for diamond ore nearby
const diamonds = lib.find(['diamond_ore', 'deepslate_diamond_ore'], { maxDistance: 32, count: 10 });
console.log(`Found ${diamonds.length} diamond ores nearby:`, diamonds.map(d => lib.fmt(d.position)));

// Check for iron ore nearby
const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 10 });
console.log(`Found ${ironOres.length} iron ores nearby:`, ironOres.map(i => lib.fmt(i.position)));

// Check inventory
console.log('Inventory now:', JSON.stringify(lib.inv()));
