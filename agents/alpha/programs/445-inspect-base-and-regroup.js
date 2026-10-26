// programs/445-inspect-base-and-regroup.js
console.log('=== Program 445: Base Inspection & Inventory Check ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check connected players and locations
console.log('Players online:', Object.keys(bot.players).join(', '));
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} visible at: ${lib.fmt(p.entity.position)}`);
  } else {
    console.log(`Player ${name} not in visual range`);
  }
}

// 2. Find all chests near base
const chestBlocks = bot.findBlocks({
  matching: mcData.blocksByName.chest.id,
  maxDistance: 16,
  count: 10
});
console.log(`Found ${chestBlocks.length} chests near base:`, chestBlocks.map(p => lib.fmt(p)).join(', '));

for (const cp of chestBlocks) {
  try {
    const contents = await lib.chestContents(cp.x, cp.y, cp.z);
    console.log(`Chest at ${lib.fmt(cp)} contents:`, JSON.stringify(contents));
  } catch (err) {
    console.log(`Failed inspecting chest at ${lib.fmt(cp)}:`, err.message);
  }
}

// 3. Find all furnaces near base and check their contents
const furnaceBlocks = bot.findBlocks({
  matching: [mcData.blocksByName.furnace.id, mcData.blocksByName.lit_furnace?.id].filter(Boolean),
  maxDistance: 16,
  count: 10
});
console.log(`Found ${furnaceBlocks.length} furnaces near base:`, furnaceBlocks.map(p => lib.fmt(p)).join(', '));

for (const fp of furnaceBlocks) {
  try {
    const furnaceBlock = bot.blockAt(fp);
    const furnace = await bot.openFurnace(furnaceBlock);
    const input = furnace.inputItem();
    const fuel = furnace.fuelItem();
    const output = furnace.outputItem();
    console.log(`Furnace at ${lib.fmt(fp)}: input=${input ? `${input.name}x${input.count}` : 'empty'}, fuel=${fuel ? `${fuel.name}x${fuel.count}` : 'empty'}, output=${output ? `${output.name}x${output.count}` : 'empty'}`);
    
    // Take output if any
    if (output) {
      await furnace.takeOutput();
      console.log(`Took output from furnace at ${lib.fmt(fp)}`);
    }
    furnace.close();
  } catch (err) {
    console.log(`Failed inspecting furnace at ${lib.fmt(fp)}:`, err.message);
  }
}

console.log('Alpha inventory now:', JSON.stringify(lib.inv()));
