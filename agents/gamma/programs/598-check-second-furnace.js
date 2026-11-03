// programs/598-check-second-furnace.js
console.log('=== CHECK FURNACE AT (295, 72, -57) ===');
const fPos = new Vec3(295, 72, -57);
const fb = bot.blockAt(fPos);
if (fb) {
  try {
    await lib.goTo(294, 72, -57, 1.2, { timeoutMs: 4000 });
    const fn = await bot.openFurnace(fb);
    console.log('Furnace input:', fn.inputItem() ? `${fn.inputItem().name} x${fn.inputItem().count}` : 'empty');
    console.log('Furnace fuel:', fn.fuelItem() ? `${fn.fuelItem().name} x${fn.fuelItem().count}` : 'empty');
    console.log('Furnace output:', fn.outputItem() ? `${fn.outputItem().name} x${fn.outputItem().count}` : 'empty');
    if (fn.outputItem() && fn.outputItem().name === 'iron_ingot') {
      await fn.takeOutput();
      console.log('Took iron ingots from (295, 72, -57)!');
    }
    await fn.close();
  } catch (e) {
    console.log('Furnace note:', e.message);
  }
}
console.log('Iron in inventory:', lib.count('iron_ingot'));
