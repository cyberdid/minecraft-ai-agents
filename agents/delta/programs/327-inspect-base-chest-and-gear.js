// programs/327-inspect-base-chest-and-gear.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Open chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log(`Chest items (${items.length}):`);
    for (const i of items) {
      console.log(`  ${i.name} x${i.count}`);
    }
    
    // Withdraw cobblestone and planks if available
    for (const i of items) {
      if (i.name === 'cobblestone' || i.name.endsWith('_planks') || i.name.includes('sword') || i.name.includes('pickaxe') || i.name.includes('iron') || i.name.includes('shield')) {
        try {
          await chest.withdraw(i.type, null, i.count);
          console.log(`Withdrew ${i.name} x${i.count}`);
        } catch (e) {}
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest open error:', e.message);
  }
}

// 2. Check current inventory
console.log('Delta inventory:');
for (const i of bot.inventory.items()) {
  console.log(`  ${i.name} x${i.count}`);
}

// 3. Check time and sleeping condition
const time = bot.time.timeOfDay;
console.log(`Current time: ${time} (can sleep at 12542)`);
if (time >= 12542 && time <= 23460) {
  console.log('Bedtime! Finding bed...');
  const bed = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 6, count: 1 })[0];
  if (bed) {
    try {
      await bot.sleep(bot.blockAt(bed));
      console.log('Sleeping to skip night!');
      bot.chat('delta: Sleeping in Bed 2 to skip night!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
}
