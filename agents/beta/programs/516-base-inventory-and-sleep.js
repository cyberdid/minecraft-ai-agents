// programs/516-base-inventory-and-sleep.js
console.log('=== Step: Inspect Base, Teammates, Chests, and Manage Night ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

// 1. Report all players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name || 'none'}`);
  } else {
    console.log(`Player ${name}: not in entity range (different dimension or far)`);
  }
}

// 2. Check blocks inside base
const bedBlock = bot.findBlock({ matching: b => b.name.includes('bed'), maxDistance: 5 });
if (bedBlock) {
  console.log(`Found bed at ${lib.fmt(bedBlock.position)} (${bedBlock.name})`);
}

const chestBlock = bot.findBlock({ matching: mcData.blocksByName.chest.id, maxDistance: 5 });
if (chestBlock) {
  console.log(`Found chest at ${lib.fmt(chestBlock.position)}`);
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.items().map(it => `${it.name} x${it.count}`);
    console.log(`Chest contents (${items.length} stacks):`, items.join(', ') || 'empty');
    await chest.close();
  } catch (e) {
    console.log('Error opening chest:', e.message);
  }
} else {
  console.log('No chest within 5m');
}

// Check furnaces
const furnaceIds = [mcData.blocksByName.furnace.id, mcData.blocksByName.lit_furnace?.id].filter(Boolean);
const furnaces = bot.findBlocks({ matching: furnaceIds, maxDistance: 5, count: 5 });
console.log(`Found ${furnaces.length} furnaces`);
for (const fp of furnaces) {
  try {
    const fBlock = bot.blockAt(fp);
    const f = await bot.openFurnace(fBlock);
    console.log(`Furnace at ${lib.fmt(fp)}: input=${f.inputItem()?.name} x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name} x${f.fuelItem()?.count}, output=${f.outputItem()?.name} x${f.outputItem()?.count}`);
    await f.close();
  } catch (e) {
    console.log(`Error inspecting furnace at ${lib.fmt(fp)}:`, e.message);
  }
}

// Check time and sleep if night
console.log(`Current timeOfDay: ${bot.time.timeOfDay}`);
if (bot.time.timeOfDay >= 12541 && bot.time.timeOfDay <= 23458) {
  console.log('Night time! Attempting to sleep...');
  if (bedBlock) {
    try {
      await bot.sleep(bedBlock);
      console.log('Sleeping in bed! Waiting 6s for dawn...');
      await sleep(6000);
      console.log('Woke up! timeOfDay:', bot.time.timeOfDay);
    } catch (e) {
      console.log('Sleep error:', e.message);
    }
  }
} else {
  console.log(`Not sleep time yet (need 12541..23458, current is ${bot.time.timeOfDay}).`);
}

return {
  timeOfDay: bot.time.timeOfDay,
  pos: bot.entity.position,
  dimension: bot.game.dimension
};
