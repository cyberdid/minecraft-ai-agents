// programs/572-check-furnaces.js
for (const fPos of [new Vec3(295, 72, -55), new Vec3(295, 72, -57)]) {
  const fb = bot.blockAt(fPos);
  if (fb && fb.name.includes('furnace')) {
    try {
      await lib.goTo(fPos.x - 1, fPos.y, fPos.z, 1.5, { timeoutMs: 4000 });
      const fn = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fPos)}:`);
      console.log('  input:', fn.inputItem() ? `${fn.inputItem().name} x${fn.inputItem().count}` : 'empty');
      console.log('  fuel:', fn.fuelItem() ? `${fn.fuelItem().name} x${fn.fuelItem().count}` : 'empty');
      console.log('  output:', fn.outputItem() ? `${fn.outputItem().name} x${fn.outputItem().count}` : 'empty');
      await fn.close();
    } catch (e) {
      console.log(`Furnace at ${lib.fmt(fPos)} error:`, e.message);
    }
  }
}
