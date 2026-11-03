// programs/578-inspect-furnace-slots.js
const fb = bot.blockAt(new Vec3(295, 72, -55));
if (fb) {
  const f = await bot.openFurnace(fb);
  console.log('Furnace inspection:');
  console.log('  input:', f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : 'empty');
  console.log('  fuel:', f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : 'empty');
  console.log('  output:', f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : 'empty');
  
  // If output is iron, take it
  if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
    await f.takeOutput();
    console.log('Withdrew iron_ingot!');
  }
  
  // Put coal or planks if fuel is empty
  if (!f.fuelItem() && f.inputItem()) {
    const fuel = bot.inventory.items().find(i => i.name.includes('planks') || i.name === 'coal');
    if (fuel) {
      console.log(`Putting fuel: ${fuel.name} x2`);
      await f.putFuel(fuel.type, null, 2);
    }
  }
  f.close();
}

console.log('Delta inventory:', JSON.stringify(lib.inv()));
