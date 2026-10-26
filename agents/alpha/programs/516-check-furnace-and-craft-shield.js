// programs/516-check-furnace-and-craft-shield.js
console.log('=== Program 516: Check Base Furnace & Craft Shield ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check furnace at (295, 72, -55) and (295, 72, -57)
for (const fPos of [new Vec3(295, 72, -55), new Vec3(295, 72, -57)]) {
  const fBlock = bot.blockAt(fPos);
  if (!fBlock) continue;
  try {
    const furnace = await bot.openFurnace(fBlock);
    console.log(`Furnace at ${lib.fmt(fPos)}:`);
    console.log(`  Input: ${furnace.inputItem() ? furnace.inputItem().name + ' x' + furnace.inputItem().count : 'none'}`);
    console.log(`  Fuel: ${furnace.fuelItem() ? furnace.fuelItem().name + ' x' + furnace.fuelItem().count : 'none'}`);
    console.log(`  Output: ${furnace.outputItem() ? furnace.outputItem().name + ' x' + furnace.outputItem().count : 'none'}`);
    if (furnace.outputItem()) {
      await furnace.takeOutput();
      console.log('Took furnace output!');
    }
    await furnace.close();
  } catch (err) {
    console.log(`Error checking furnace at ${lib.fmt(fPos)}: ${err.message}`);
  }
}

// 2. Check chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems().map(i => `${i.name} x${i.count}`).join(', ');
    console.log(`Chest items: ${items || 'empty'}`);
    // Check if any wood or iron is in chest
    for (const item of chest.containerItems()) {
      if (item.name.includes('iron') || item.name.includes('plank') || item.name.includes('log') || item.name.includes('sword') || item.name.includes('pickaxe')) {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.name} x${item.count}`);
      }
    }
    await chest.close();
  } catch (err) {
    console.log('Chest note:', err.message);
  }
}

console.log('Alpha inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', ') || 'empty');
