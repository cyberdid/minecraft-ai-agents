// programs/237-check-base-chest.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.pathfinder.stop();

// Look at chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
console.log('Chest block:', chestBlock?.name);

if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    console.log('--- CHEST CONTENTS ---');
    const items = chest.containerItems();
    for (const item of items) {
      console.log(`  ${item.name} x${item.count}`);
    }
    await chest.close();
  } catch (e) {
    console.log('Chest open error:', e.message);
  }
}

// Check furnace at (295, 72, -55)
const furnacePos = new Vec3(295, 72, -55);
const furnaceBlock = bot.blockAt(furnacePos);
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    console.log('Furnace input:', furnace.inputItem()?.name, 'fuel:', furnace.fuelItem()?.name, 'output:', furnace.outputItem()?.name, 'x', furnace.outputItem()?.count);
    await furnace.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}
