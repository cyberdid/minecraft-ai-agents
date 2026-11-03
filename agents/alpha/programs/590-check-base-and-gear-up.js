// programs/590-check-base-and-gear-up.js
console.log('=== Program 590: Check Base & Gear Up ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// List all players
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username) {
    const posStr = p.entity ? lib.fmt(p.entity.position) : 'unknown/distant';
    console.log(`Player ${p.username}: pos ${posStr}`);
  }
}

// Check chests in base
const chestCoords = [
  new Vec3(293, 72, -57),
  new Vec3(294, 72, -57),
  new Vec3(292, 72, -57)
];

for (const cpos of chestCoords) {
  const blk = bot.blockAt(cpos);
  if (blk && blk.name.includes('chest')) {
    console.log(`Found chest at ${lib.fmt(cpos)} (${blk.name})`);
    try {
      const chest = await bot.openContainer(blk);
      const items = chest.containerItems().map(i => `${i.name} x${i.count}`).join(', ');
      console.log(`Chest items: ${items || 'empty'}`);
      
      // Grab useful items: swords, pickaxes, shields, iron, food, cobblestone, torches, wood
      for (const it of chest.containerItems()) {
        if (it.name.includes('sword') || it.name.includes('shield') || it.name.includes('pickaxe') ||
            it.name.includes('iron') || it.name.includes('cobble') || it.name.includes('pork') ||
            it.name.includes('beef') || it.name.includes('mutton') || it.name.includes('bread') ||
            it.name.includes('log') || it.name.includes('plank')) {
          console.log(`Withdrawing ${it.name} x${it.count}...`);
          await chest.withdraw(it.type, null, it.count);
        }
      }
      await chest.close();
    } catch (e) {
      console.log(`Error opening chest at ${lib.fmt(cpos)}:`, e.message);
    }
  }
}

// Check furnaces in base
const furnaceCoords = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const fpos of furnaceCoords) {
  const blk = bot.blockAt(fpos);
  if (blk && blk.name.includes('furnace')) {
    try {
      const fn = await bot.openFurnace(blk);
      console.log(`Furnace at ${lib.fmt(fpos)}: input=${fn.inputItem()?.name} fuel=${fn.fuelItem()?.name} output=${fn.outputItem()?.name}x${fn.outputItem()?.count}`);
      if (fn.outputItem()) {
        await fn.takeOutput();
      }
      await fn.close();
    } catch (e) {
      console.log(`Error checking furnace at ${lib.fmt(fpos)}:`, e.message);
    }
  }
}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Current Inventory after loot check:', lib.inv());
