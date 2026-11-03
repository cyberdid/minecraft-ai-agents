// programs/804-check-furnaces-and-portal-prep.js
console.log('=== Program 804: Furnace Check & Portal Prep ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Check furnaces
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const fp of furnacePositions) {
  const fb = bot.blockAt(fp);
  if (fb && fb.name.includes('furnace')) {
    try {
      const furnace = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fp)}: input=${furnace.inputItem()?.name}x${furnace.inputItem()?.count}, fuel=${furnace.fuelItem()?.name}x${furnace.fuelItem()?.count}, output=${furnace.outputItem()?.name}x${furnace.outputItem()?.count}`);
      if (furnace.outputItem()) {
        console.log(`Taking ${furnace.outputItem().name} x${furnace.outputItem().count}...`);
        await furnace.takeOutput();
      }
      furnace.close();
    } catch (e) {
      console.log(`Furnace ${lib.fmt(fp)} notice:`, e.message);
    }
  }
}

console.log('Inventory after furnace check:', lib.inv());

// Check if Delta or Beta want food
const cooked = bot.inventory.items().find(i => i.name.includes('cooked') || i.name === 'bread');
if (cooked && cooked.count > 4) {
  bot.chat(`alpha: Depositing ${cooked.name} x${Math.floor(cooked.count / 2)} in base chest for Delta and Beta!`);
  const chestBlock = bot.findBlock({ matching: b => b && b.name.includes('chest'), maxDistance: 5 });
  if (chestBlock) {
    const chest = await bot.openChest(chestBlock);
    await chest.deposit(cooked.type, null, Math.floor(cooked.count / 2));
    chest.close();
  }
}

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
