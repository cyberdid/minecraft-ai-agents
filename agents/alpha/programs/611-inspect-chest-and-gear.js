// programs/611-inspect-chest-and-gear.js
console.log('=== Program 611: Inspect Chest & Gear Up ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems().map(i => `${i.name} x${i.count}`).join(', ');
    console.log(`Base chest items: ${items || 'empty'}`);
    
    // Withdraw any tools, weapons, armor, rods, food, cobble, iron, logs, planks
    for (const it of chest.containerItems()) {
      if (it.name.includes('sword') || it.name.includes('pickaxe') || it.name.includes('shield') ||
          it.name.includes('rod') || it.name.includes('iron') || it.name.includes('cobble') ||
          it.name.includes('pork') || it.name.includes('beef') || it.name.includes('bread') ||
          it.name.includes('log') || it.name.includes('plank')) {
        console.log(`Withdrawing ${it.name} x${it.count}...`);
        await chest.withdraw(it.type, null, it.count);
      }
    }
    await chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

console.log('Alpha inventory after chest:', lib.inv());
