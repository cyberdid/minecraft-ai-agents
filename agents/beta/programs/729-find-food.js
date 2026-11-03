// programs/729-find-food.js
console.log('=== Program 729: Search for Food ===');
const chests = bot.findBlocks({
  matching: b => b && b.name.includes('chest'),
  maxDistance: 16,
  count: 10
});
console.log(`Found ${chests.length} chests near base:`);
for (const p of chests) {
  try {
    const cb = bot.blockAt(p);
    const chest = await bot.openChest(cb);
    const items = chest.containerItems().map(i => `${i.name}x${i.count}`);
    console.log(`Chest at ${lib.fmt(p)}: ${items.join(', ') || 'empty'}`);
    const foodItems = chest.containerItems().filter(i => 
      ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'cooked_cod', 'cooked_salmon', 'baked_potato', 'carrot', 'sweet_berries'].includes(i.name)
    );
    if (foodItems.length > 0) {
      console.log(`  -> Food found in chest at ${lib.fmt(p)}:`, foodItems.map(i => `${i.name}x${i.count}`).join(', '));
      // Withdraw 16 food
      for (const fi of foodItems) {
        const withdrawCount = Math.min(fi.count, 16 - lib.count(fi.name));
        if (withdrawCount > 0) {
          await chest.withdraw(fi.type, null, withdrawCount);
          console.log(`  -> Withdrew ${withdrawCount} ${fi.name}`);
        }
      }
    }
    await chest.close();
  } catch (e) {
    console.log(`Error checking chest at ${lib.fmt(p)}:`, e.message);
  }
}

// Also check all furnaces
const furnaces = bot.findBlocks({
  matching: b => b && b.name.includes('furnace'),
  maxDistance: 16,
  count: 10
});
console.log(`Found ${furnaces.length} furnaces near base:`);
for (const p of furnaces) {
  try {
    const fb = bot.blockAt(p);
    const furnace = await bot.openFurnace(fb);
    console.log(`Furnace at ${lib.fmt(p)}: input=${furnace.inputItem()?.name}x${furnace.inputItem()?.count}, output=${furnace.outputItem()?.name}x${furnace.outputItem()?.count}`);
    if (furnace.outputItem() && ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread'].includes(furnace.outputItem()?.name)) {
      await furnace.takeOutput();
      console.log(`  -> Took ${furnace.outputItem()?.name} from furnace!`);
    }
    await furnace.close();
  } catch (e) {
    console.log(`Error checking furnace at ${lib.fmt(p)}:`, e.message);
  }
}
console.log('Final inventory:', lib.inv());
