// programs/185-inspect-furnaces-and-beds.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// 1. Set spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn set at bed successfully!');
} catch (err) {
  console.log('setSpawn notice:', err.message);
}

// 2. Check furnaces
const furnaces = bot.findBlocks({
  matching: b => b.name.includes('furnace'),
  maxDistance: 6,
  count: 5
});

for (const pos of furnaces) {
  try {
    const block = bot.blockAt(pos);
    const furnace = await bot.openFurnace(block);
    console.log(`Furnace at ${lib.fmt(pos)}:`);
    console.log(`  Input:`, furnace.inputItem() ? `${furnace.inputItem().name} x${furnace.inputItem().count}` : 'empty');
    console.log(`  Fuel:`, furnace.fuelItem() ? `${furnace.fuelItem().name} x${furnace.fuelItem().count}` : 'empty');
    console.log(`  Output:`, furnace.outputItem() ? `${furnace.outputItem().name} x${furnace.outputItem().count}` : 'empty');
    
    // Take output if any
    if (furnace.outputItem()) {
      await furnace.takeOutput();
      console.log('  Took output!');
    }
    furnace.close();
  } catch (err) {
    console.log(`Error checking furnace at ${lib.fmt(pos)}:`, err.message);
  }
}

// 3. Check inventory
console.log('Delta inventory:', JSON.stringify(lib.inv()));

// 4. Check other players
for (const name in bot.players) {
  const p = bot.players[name];
  if (p && p.entity && p !== bot.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  }
}
