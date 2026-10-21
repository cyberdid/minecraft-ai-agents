// programs/061-check-furnace.js
// Open furnace at (295, 72, -55) and inspect items

const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
console.log('Furnace block:', furnaceBlock.name);
const furnace = await bot.openFurnace(furnaceBlock);
console.log('Input:', furnace.inputItem() ? `${furnace.inputItem().name} x${furnace.inputItem().count}` : 'empty');
console.log('Fuel:', furnace.fuelItem() ? `${furnace.fuelItem().name} x${furnace.fuelItem().count}` : 'empty');
console.log('Output:', furnace.outputItem() ? `${furnace.outputItem().name} x${furnace.outputItem().count}` : 'empty');
furnace.close();
