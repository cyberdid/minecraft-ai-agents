// programs/693-check-overworld-chests-and-furnaces.js
console.log('=== Program 693: Inspect Overworld Base Storage ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Inspect Chest at (293, 72, -57)
const chestBlock = bot.findBlock({ matching: mcData.blocksByName.chest.id, maxDistance: 8 });
if (chestBlock) {
  try {
    await lib.goTo(chestBlock.position.x, chestBlock.position.y, chestBlock.position.z + 1, 1.5, { timeoutMs: 5000 });
    const chest = await bot.openChest(chestBlock);
    console.log('Base Chest contains:');
    for (const item of chest.items()) {
      console.log(`- ${item.name} x${item.count}`);
    }
    // Take iron ingots, gold ingots, shields, armor, cooked food
    for (const item of chest.items()) {
      if (item.name.includes('iron') || item.name.includes('gold') || item.name.includes('shield') || item.name.includes('helmet') || item.name.includes('chestplate') || item.name.includes('leggings') || item.name.includes('boots') || item.name.includes('cooked') || item.name === 'bread') {
        console.log(`Withdrawing ${item.name} x${item.count}...`);
        await chest.withdraw(item.type, null, item.count);
      }
    }
    await chest.close();
  } catch (e) {
    console.log('Chest inspection error:', e.message);
  }
}

// 2. Check Furnaces at (295, 72, -54..-56)
const furnaces = bot.findBlocks({ matching: mcData.blocksByName.furnace.id, maxDistance: 8 });
console.log(`Found ${furnaces.length} furnaces:`);
for (const fp of furnaces) {
  const fb = bot.blockAt(fp);
  console.log(`Furnace at ${lib.fmt(fp)}: ${fb ? fb.name : 'null'}`);
}

console.log('Current Inv after chest withdrawal:', JSON.stringify(lib.inv()));
