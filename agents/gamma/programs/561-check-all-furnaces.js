// programs/561-check-all-furnaces.js
console.log('=== CHECK MORE FURNACES ===');
const furnacePositions = [
  new Vec3(286, 72, -62),
  new Vec3(297, 66, -81),
  new Vec3(302, 47, -54),
  new Vec3(306, 52, -43)
];

for (const fp of furnacePositions) {
  const fb = bot.blockAt(fp);
  if (fb && fb.name.includes('furnace')) {
    try {
      const fn = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fp)}:`);
      console.log('  input:', fn.inputItem() ? `${fn.inputItem().name} x${fn.inputItem().count}` : 'empty');
      console.log('  fuel:', fn.fuelItem() ? `${fn.fuelItem().name} x${fn.fuelItem().count}` : 'empty');
      console.log('  output:', fn.outputItem() ? `${fn.outputItem().name} x${fn.outputItem().count}` : 'empty');
      await fn.close();
    } catch (e) {
      console.log(`Furnace at ${lib.fmt(fp)}: error ${e.message}`);
    }
  } else {
    console.log(`Block at ${lib.fmt(fp)} is ${fb ? fb.name : 'null'}`);
  }
}
