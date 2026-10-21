// programs/131-check-furnace2.js
const f2 = bot.blockAt(new Vec3(295, 72, -57));
if (f2) {
  const furnace = await bot.openFurnace(f2);
  console.log('F2 input:', furnace.inputItem()?.name, furnace.inputItem()?.count);
  console.log('F2 fuel:', furnace.fuelItem()?.name, furnace.fuelItem()?.count);
  console.log('F2 output:', furnace.outputItem()?.name, furnace.outputItem()?.count);
  furnace.close();
}

const chest = await lib.chestContents();
console.log('Chest raw_iron / iron_ingot:', chest.raw_iron, chest.iron_ingot);
