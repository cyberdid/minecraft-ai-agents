// programs/161-check-furnaces-and-arm.js
console.log('--- CHECK FURNACES AND RE-ARM ---');

// Check the two furnaces
for (const pos of [new Vec3(295, 72, -55), new Vec3(295, 72, -57)]) {
  const b = bot.blockAt(pos);
  if (b && b.name.includes('furnace')) {
    console.log(`Inspecting furnace at ${lib.fmt(pos)}...`);
    try {
      const f = await bot.openFurnace(b);
      console.log(`Furnace at ${lib.fmt(pos)}: input=`, f.inputItem()?.name, f.inputItem()?.count,
                  'fuel=', f.fuelItem()?.name, f.fuelItem()?.count,
                  'output=', f.outputItem()?.name, f.outputItem()?.count);
      if (f.outputItem()) {
        console.log(`Taking output ${f.outputItem().name} x ${f.outputItem().count}...`);
        await f.takeOutput();
      }
      f.close();
    } catch (e) {
      console.log(`Furnace ${lib.fmt(pos)} error:`, e.message);
    }
  }
}

console.log('Inv after furnace check:', JSON.stringify(lib.inv()));
